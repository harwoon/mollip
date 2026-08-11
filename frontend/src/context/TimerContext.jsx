import { API_URL } from "../config/apiUrl.js"
import { createContext, useCallback, useContext, useState, useEffect, useRef } from "react"
import { socket } from "../../util/socket.js"

const TimerContext = createContext()

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user"))
    } catch {
        return null
    }
}

export function TimerProvider({ children }) {
    const [selectedSubject, setSelectedSubject] = useState(() => {
        const saved = localStorage.getItem("mollip_selectedSubject")
        return saved ? JSON.parse(saved) : null
    })

    const [time, setTime] = useState(() => {
        const saved = localStorage.getItem("mollip_time")
        return saved ? Number(saved) : 0
    })

    const [isRunning, setIsRunning] = useState(() => {
        const saved = localStorage.getItem("mollip_isRunning")
        return saved ? JSON.parse(saved) : false
    })

    const [actualStartTime, setActualStartTime] = useState(() => {
        const saved = localStorage.getItem("mollip_actualStartTime")
        return saved ? new Date(saved) : null
    })

    const [timerStatus, setTimerStatus] = useState(() => {
        const savedRunning = localStorage.getItem("mollip_isRunning")
        if (savedRunning && JSON.parse(savedRunning)) return "RUNNING"
        return Number(localStorage.getItem("mollip_time")) > 0
            ? "STOPPED"
            : "IDLE"
    })

    const [isSaving, setIsSaving] = useState(false)

    const expectedTimeRef = useRef(Number(localStorage.getItem("mollip_time")) || 0)
    const prevSubjectRef = useRef(selectedSubject?._id)
    const timeRef = useRef(time)
    const savingRef = useRef(false)

    useEffect(() => {
        timeRef.current = time
    }, [time])
    // 로컬스토리지 동기화
    useEffect(() => {
        if (selectedSubject) {
            localStorage.setItem("mollip_selectedSubject", JSON.stringify(selectedSubject))
        } else {
            localStorage.removeItem("mollip_selectedSubject")
        }
    }, [selectedSubject])

    useEffect(() => {
        if (!isRunning) {
            localStorage.setItem("mollip_time", time)
            expectedTimeRef.current = time
        }
    }, [isRunning, time])

    useEffect(() => {
        localStorage.setItem("mollip_isRunning", JSON.stringify(isRunning))
    }, [isRunning])

    useEffect(() => {
        if (actualStartTime) {
            localStorage.setItem("mollip_actualStartTime", actualStartTime.toISOString())
        } else {
            localStorage.removeItem("mollip_actualStartTime")
        }
    }, [actualStartTime])

    // 과목 변경 시 리셋
    useEffect(() => {
        if (prevSubjectRef.current !== selectedSubject?._id) {
            setTime(0)
            setIsRunning(false)
            setActualStartTime(null)
            setTimerStatus("IDLE")
            setIsSaving(false)
            savingRef.current = false
            expectedTimeRef.current = 0

            localStorage.removeItem("mollip_time")
            localStorage.removeItem("mollip_isRunning")
            localStorage.removeItem("mollip_actualStartTime")

            prevSubjectRef.current = selectedSubject?._id
        }
    }, [selectedSubject?._id])

    // 10ms 타이머 엔진 (여기서만 고속 리렌더링 발생)
    useEffect(() => {
        let interval
        if (isRunning && actualStartTime) {
            const startMs = new Date(actualStartTime).getTime()
            const baseTicks = expectedTimeRef.current

            interval = setInterval(() => {
                const diffMs = Date.now() - startMs
                const ticks = Math.floor(diffMs / 10)
                setTime(baseTicks + ticks)
            }, 10)
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [isRunning, actualStartTime])

    // 전역 공부 시간 저장 함수
    const handleGlobalSave = useCallback(async (studySeconds) => {
        if (!selectedSubject) return false
        const userToken = localStorage.getItem("token")
        if (!userToken) return false

        try {
            const kstOffset = new Date().getTimezoneOffset() * 60000
            const todayString = new Date(Date.now() - kstOffset).toISOString().split("T")[0]

            const response = await fetch(
                `${API_URL}/study/addStudy`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${userToken}`,
                    },

                    body: JSON.stringify({
                        studyTitle:
                            selectedSubject.subjectName,

                        studyDate:
                            todayString,

                        sumStudyTime:
                            studySeconds,
                    }),
                },
            )

            if (!response.ok) {
                throw new Error(
                    "서버 저장 실패",
                )
            }

            // 공부 저장 성공 후
            // 그룹 알림 다시 조회하도록 신호
            window.dispatchEvent(
                new Event(
                    "weekly-group-notice-created",
                ),
            )

            return true
        } catch (error) {
            console.error("전역 타이머 저장 에러:", error)
            return false
        }
    }, [selectedSubject])

    const startTimer = useCallback(() => {
        if (!selectedSubject || isRunning || savingRef.current) {
            return false
        }

        expectedTimeRef.current = timeRef.current
        setActualStartTime(new Date())
        setIsRunning(true)
        setTimerStatus("RUNNING")

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

        window.dispatchEvent(new Event("mollip-open-floating-timer"))
        window.dispatchEvent(new Event("mollip-timer-restarted"))
        return true
    }, [isRunning, selectedSubject])

    const stopTimer = useCallback(async (reason = "manual") => {
        if (!selectedSubject || !isRunning || savingRef.current) {
            return false
        }

        savingRef.current = true
        setIsSaving(true)
        setTimerStatus("SAVING")

        const stoppedAt = new Date()
        const frozenTime = timeRef.current
        const startMs = actualStartTime
            ? new Date(actualStartTime).getTime()
            : null
        const studySeconds = startMs
            ? Math.max(0, Math.floor((stoppedAt.getTime() - startMs) / 1000))
            : 0

        setIsRunning(false)
        expectedTimeRef.current = frozenTime

        const storedUser = getStoredUser()
        if (storedUser?.groupId && storedUser?._id) {
            socket.emit("stopStudy", {
                groupId: storedUser.groupId,
                userId: storedUser._id
            })
        }

        const saved = studySeconds === 0 || await handleGlobalSave(studySeconds)

        if (saved) {
            setActualStartTime(null)
            setTime(frozenTime)
            setTimerStatus("STOPPED")
            window.dispatchEvent(new Event("mollip-study-record-saved"))
        } else {
            expectedTimeRef.current = frozenTime
            setActualStartTime(new Date())
            setIsRunning(true)
            setTimerStatus("RUNNING")

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

        savingRef.current = false
        setIsSaving(false)

        window.dispatchEvent(new CustomEvent("mollip-timer-stopped", {
            detail: { reason, saved }
        }))

        return saved
    }, [actualStartTime, handleGlobalSave, isRunning, selectedSubject])

    const onStopAndSaveForLogout = async () => {
        if (isRunning) {
            await stopTimer("logout")
        }
    }

    return (
        <TimerContext.Provider value={{
            selectedSubject, setSelectedSubject,
            time, setTime,
            isRunning, setIsRunning,
            actualStartTime, setActualStartTime,
            timerStatus,
            isSaving,
            startTimer,
            stopTimer,
            handleGlobalSave,
            onStopAndSaveForLogout
        }}>
            {children}
        </TimerContext.Provider>
    )
}

export function useTimer() {
    return useContext(TimerContext)
}
