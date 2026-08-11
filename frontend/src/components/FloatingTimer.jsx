import { createPortal } from "react-dom"
import { useCallback, useEffect, useRef, useState } from "react"
import { FiAlertTriangle, FiClock, FiPause, FiPlay, FiSquare, FiX } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

import { useTimer } from "../context/TimerContext"
import { socket } from "../../util/socket"
import AppAlert from "./common/AppAlert.jsx"
import styles from "./FloatingTimer.module.css"

const HIDDEN_WARNING_DELAY_MS = 5 * 60 * 1000
const WARNING_GRACE_MS = 60 * 1000

function formatTime(currentTime = 0) {
    const hours = Math.floor(currentTime / 360000)
    const minutes = Math.floor((currentTime % 360000) / 6000)
    const seconds = Math.floor((currentTime % 6000) / 100)

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function copyDocumentStyles(targetDocument) {
    document
        .querySelectorAll('link[rel="stylesheet"], style')
        .forEach((styleNode) => {
            targetDocument.head.appendChild(styleNode.cloneNode(true))
        })
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user"))
    } catch {
        return null
    }
}

export default function FloatingTimer() {
    const navigate = useNavigate()
    const {
        selectedSubject,
        time,
        setTime,
        isRunning,
        setIsRunning,
        actualStartTime,
        setActualStartTime,
        handleGlobalSave
    } = useTimer()

    const [pipWindow, setPipWindow] = useState(null)
    const [focusStatus, setFocusStatus] = useState("RUNNING")
    const [remainingSeconds, setRemainingSeconds] = useState(60)
    const [pausedTime, setPausedTime] = useState(0)
    const [saveFailed, setSaveFailed] = useState(false)

    const pipWindowRef = useRef(null)
    const lastActivityAtRef = useRef(null)
    const warningDeadlineRef = useRef(null)
    const savingRef = useRef(false)
    const pausedByInactivityRef = useRef(false)
    const manualStopPendingRef = useRef(false)
    const timeRef = useRef(time)

    useEffect(() => {
        timeRef.current = time
    }, [time])

    const closeFloatingWindow = useCallback(() => {
        const currentWindow = pipWindowRef.current
        pipWindowRef.current = null
        setPipWindow(null)

        if (currentWindow && !currentWindow.closed) {
            currentWindow.close()
        }
    }, [])

    const openFloatingWindow = useCallback(async () => {
        if (pipWindowRef.current && !pipWindowRef.current.closed) {
            pipWindowRef.current.focus()
            return
        }

        if (!("documentPictureInPicture" in window)) {
            window.dispatchEvent(new Event("mollip-floating-timer-unsupported"))
            return
        }

        try {
            const nextPipWindow = await window.documentPictureInPicture.requestWindow({
                width: 390,
                height: 250
            })

            copyDocumentStyles(nextPipWindow.document)
            nextPipWindow.document.title = "Mollip 집중 타이머"
            nextPipWindow.document.body.classList.add(styles.pipBody)

            nextPipWindow.addEventListener("pagehide", () => {
                if (pipWindowRef.current === nextPipWindow) {
                    pipWindowRef.current = null
                    setPipWindow(null)
                }
            })

            pipWindowRef.current = nextPipWindow
            setPipWindow(nextPipWindow)

            if ("Notification" in window && Notification.permission === "default") {
                Notification.requestPermission().catch(() => {})
            }
        } catch (error) {
            console.error("플로팅 타이머 열기 실패:", error)
        }
    }, [])

    useEffect(() => {
        const handleOpenRequest = () => {
            openFloatingWindow()
        }

        window.addEventListener("mollip-open-floating-timer", handleOpenRequest)
        return () => {
            window.removeEventListener("mollip-open-floating-timer", handleOpenRequest)
        }
    }, [openFloatingWindow])

    const resetFocusState = useCallback(() => {
        pausedByInactivityRef.current = false
        lastActivityAtRef.current = Date.now()
        warningDeadlineRef.current = null
        setPausedTime(0)
        setRemainingSeconds(60)
        setSaveFailed(false)
        setFocusStatus("RUNNING")
    }, [])

    useEffect(() => {
        const handleTimerRestarted = () => {
            resetFocusState()
        }

        window.addEventListener("mollip-timer-restarted", handleTimerRestarted)
        return () => {
            window.removeEventListener("mollip-timer-restarted", handleTimerRestarted)
        }
    }, [resetFocusState])

    const saveCurrentSession = useCallback(async ({
        keepWindowOpen,
        resetTime = true
    }) => {
        if (savingRef.current) return false
        savingRef.current = true

        const startMs = actualStartTime
            ? new Date(actualStartTime).getTime()
            : null
        const studySeconds = startMs
            ? Math.max(0, Math.floor((Date.now() - startMs) / 1000))
            : 0

        const storedUser = getStoredUser()
        if (storedUser?.groupId && storedUser?._id) {
            socket.emit("stopStudy", {
                groupId: storedUser.groupId,
                userId: storedUser._id
            })
        }

        const saved = studySeconds === 0 || await handleGlobalSave(studySeconds)

        if (saved) {
            if (resetTime) {
                setTime(0)
            }
            setActualStartTime(null)
            window.dispatchEvent(new Event("mollip-study-record-saved"))
        } else {
            setSaveFailed(true)
        }

        savingRef.current = false

        if (saved && !keepWindowOpen) {
            closeFloatingWindow()
        }

        return saved
    }, [actualStartTime, closeFloatingWindow, handleGlobalSave, setActualStartTime, setTime])

    const pauseForInactivity = useCallback(async () => {
        if (!isRunning || savingRef.current) return

        pausedByInactivityRef.current = true
        lastActivityAtRef.current = Date.now()
        warningDeadlineRef.current = null
        setPausedTime(timeRef.current)
        setSaveFailed(false)
        setFocusStatus("PAUSED")
        await saveCurrentSession({
            keepWindowOpen: true,
            resetTime: true
        })
        setIsRunning(false)
    }, [isRunning, saveCurrentSession, setIsRunning])

    useEffect(() => {
        if (!isRunning) return undefined

        if (!lastActivityAtRef.current) {
            lastActivityAtRef.current = Date.now()
        }

        const registerActivity = () => {
            if (focusStatus === "RUNNING") {
                lastActivityAtRef.current = Date.now()
            }
        }

        const activityEvents = [
            "pointermove",
            "pointerdown",
            "keydown",
            "scroll",
            "touchstart"
        ]

        activityEvents.forEach((eventName) => {
            window.addEventListener(eventName, registerActivity, { passive: true })
        })

        const checkInactivityDuration = () => {
            const now = Date.now()

            if (!warningDeadlineRef.current) {
                if (now - lastActivityAtRef.current >= HIDDEN_WARNING_DELAY_MS) {
                    warningDeadlineRef.current = now + WARNING_GRACE_MS
                    setRemainingSeconds(60)
                    setFocusStatus("WARNING")

                    if ("Notification" in window && Notification.permission === "granted") {
                        new Notification("Mollip 집중 확인", {
                            body: "공부를 하지 않을 시 타이머가 멈춥니다!",
                            tag: "mollip-focus-warning"
                        })
                    }
                }
                return
            }

            const remaining = Math.max(
                0,
                Math.ceil((warningDeadlineRef.current - now) / 1000)
            )
            setRemainingSeconds(remaining)

            if (remaining === 0) {
                warningDeadlineRef.current = null
                pauseForInactivity()
            }
        }

        const intervalId = window.setInterval(checkInactivityDuration, 1000)

        return () => {
            window.clearInterval(intervalId)
            activityEvents.forEach((eventName) => {
                window.removeEventListener(eventName, registerActivity)
            })
        }
    }, [focusStatus, isRunning, pauseForInactivity])

    useEffect(() => {
        if (
            !isRunning &&
            !pausedByInactivityRef.current &&
            !manualStopPendingRef.current
        ) {
            closeFloatingWindow()
        }
    }, [closeFloatingWindow, isRunning])

    function confirmStudying() {
        lastActivityAtRef.current = Date.now()
        warningDeadlineRef.current = null
        setRemainingSeconds(60)
        setFocusStatus("RUNNING")
    }

    function resumeTimer() {
        resetFocusState()
        setActualStartTime(new Date())
        setIsRunning(true)

        const storedUser = getStoredUser()
        if (storedUser?.groupId && storedUser?._id) {
            socket.emit("startStudy", {
                groupId: storedUser.groupId,
                userId: storedUser._id,
                userName: storedUser.nickname,
                profileImg: storedUser.profileImg,
                subjectName: selectedSubject.subjectName
            })
        }
    }

    async function stopTimer() {
        pausedByInactivityRef.current = false
        manualStopPendingRef.current = true
        setIsRunning(false)
        const saved = await saveCurrentSession({
            keepWindowOpen: false,
            resetTime: false
        })
        manualStopPendingRef.current = false

        if (!saved) {
            setFocusStatus("RUNNING")
            setActualStartTime(new Date())
            setIsRunning(true)

            const storedUser = getStoredUser()
            if (storedUser?.groupId && storedUser?._id) {
                socket.emit("startStudy", {
                    groupId: storedUser.groupId,
                    userId: storedUser._id,
                    userName: storedUser.nickname,
                    profileImg: storedUser.profileImg,
                    subjectName: selectedSubject.subjectName
                })
            }
        }
    }

    function goToHome() {
        navigate("/home")
        window.focus()
    }

    useEffect(() => {
        return () => closeFloatingWindow()
    }, [closeFloatingWindow])

    const isWarning = focusStatus === "WARNING"
    const isPaused = focusStatus === "PAUSED"

    const pageWarning = (
        <AppAlert
            open={isWarning}
            type="warning"
            title="Mollip 알람"
            message={selectedSubject
                ? `[${selectedSubject.subjectName}] 공부 중인가요? ${remainingSeconds}초 안에 확인하지 않으면 타이머가 멈춥니다.`
                : "공부 중인지 확인해주세요."
            }
            confirmText="공부 중이에요"
            onConfirm={confirmStudying}
            onClose={confirmStudying}
        />
    )

    if (!pipWindow || !selectedSubject) {
        return pageWarning
    }

    const floatingTimerPortal = createPortal(
        <main className={`${styles.floatingTimer} ${isWarning ? styles.warning : ""} ${isPaused ? styles.paused : ""}`}>
            <header className={styles.header}>
                <div className={styles.status}>
                    {isWarning ? <FiAlertTriangle /> : isPaused ? <FiPause /> : <FiClock />}
                    <span>{isWarning ? "집중 확인" : isPaused ? "자동 일시정지" : "집중 중"}</span>
                </div>
                <button type="button" className={styles.closeButton} onClick={closeFloatingWindow} aria-label="플로팅 타이머 닫기">
                    <FiX />
                </button>
            </header>

            <p className={styles.subject}>{selectedSubject.subjectName} 공부 중</p>
            <strong className={styles.time}>{formatTime(isPaused ? pausedTime : time)}</strong>

            {isWarning && (
                <div className={styles.warningMessage} role="alert">
                    <strong>공부를 하지 않을 시 타이머가 멈춥니다!</strong>
                    <span>{remainingSeconds}초 안에 확인해주세요.</span>
                    <div className={styles.actionButtons}>
                        <button type="button" className={styles.homeButton} onClick={goToHome}>Mollip 홈</button>
                        <button type="button" onClick={confirmStudying}>공부 중이에요</button>
                    </div>
                </div>
            )}

            {isPaused && (
                <div className={styles.warningMessage} role="status">
                    <strong>활동이 없어 타이머가 멈췄습니다.</strong>
                    <span>{saveFailed ? "공부 기록 저장에 실패했습니다." : "공부 시간은 자동 저장되었습니다."}</span>
                    <div className={styles.actionButtons}>
                        <button type="button" className={styles.homeButton} onClick={goToHome}>Mollip 홈</button>
                        <button type="button" onClick={resumeTimer}><FiPlay /> 다시 시작</button>
                    </div>
                </div>
            )}

            {!isWarning && !isPaused && (
                <div className={styles.actionButtons}>
                    <button type="button" className={styles.homeButton} onClick={goToHome}>Mollip 홈</button>
                    <button type="button" className={styles.stopButton} onClick={stopTimer}>
                        <FiSquare /> 타이머 멈추기
                    </button>
                </div>
            )}
        </main>,
        pipWindow.document.body
    )

    return (
        <>
            {pageWarning}
            {floatingTimerPortal}
        </>
    )
}
