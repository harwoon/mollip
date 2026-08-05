import { API_URL } from "../config/apiUrl.js"
import { createContext, useContext, useState, useEffect, useRef } from "react"

const TimerContext = createContext()

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

    const expectedTimeRef = useRef(Number(localStorage.getItem("mollip_time")) || 0)
    const prevSubjectRef = useRef(selectedSubject?._id)

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
    const handleGlobalSave = async (studySeconds) => {
        if (!selectedSubject) return false
        const userToken = localStorage.getItem("token")
        if (!userToken) return false

        try {
            const kstOffset = new Date().getTimezoneOffset() * 60000
            const todayString = new Date(Date.now() - kstOffset).toISOString().split("T")[0]

            const response = await fetch(`${API_URL}/study/addStudy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    studyTitle: selectedSubject.subjectName,
                    studyDate: todayString,
                    sumStudyTime: studySeconds,
                }),
            })

            if (!response.ok) throw new Error("서버 저장 실패")
            return true
        } catch (error) {
            console.error("전역 타이머 저장 에러:", error)
            return false
        }
    }

    const onStopAndSaveForLogout = async () => {
        if (isRunning) {
            const studySecondsToSave = Math.floor(time / 100)
            setIsRunning(false)
            await handleGlobalSave(studySecondsToSave)
        }
    }

    return (
        <TimerContext.Provider value={{
            selectedSubject, setSelectedSubject,
            time, setTime,
            isRunning, setIsRunning,
            actualStartTime, setActualStartTime,
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