import React, { useState, useEffect, useRef } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function MainLayout() {
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
        return saved === "true"
    })

    const [actualStartTime, setActualStartTime] = useState(() => {
        const saved = localStorage.getItem("mollip_actualStartTime")
        return saved ? new Date(saved) : null
    })

    const startTimeRef = useRef(0)
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
        localStorage.setItem("mollip_time", time)
    }, [time])

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

    // 과목 바뀔 때만 리셋
    useEffect(() => {
        if (prevSubjectRef.current !== selectedSubject?._id) {
            setTime(0)
            setIsRunning(false)
            setActualStartTime(null)
            
            localStorage.removeItem("mollip_time")
            localStorage.removeItem("mollip_isRunning")
            localStorage.removeItem("mollip_actualStartTime")

            prevSubjectRef.current = selectedSubject?._id
        }
    }, [selectedSubject?._id])

    // 💡 완벽한 타임스탬프 기반 백그라운드 타이머 엔진
    useEffect(() => {
        let interval
        if (isRunning) {
            const initialTime = time
            startTimeRef.current = Date.now()

            interval = setInterval(() => {
                const elapsedMs = Date.now() - startTimeRef.current
                const elapsedTicks = Math.floor(elapsedMs / 10)
                setTime(initialTime + elapsedTicks)
            }, 10)
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [isRunning])

    return (
        <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
            <Sidebar
                selectedSubject={selectedSubject}
                time={time}
                isRunning={isRunning}
            />
            <main style={{ flex: 1, backgroundColor: "#F8F8FC", overflow: "auto" }}>
                <Outlet context={{
                    selectedSubject, setSelectedSubject,
                    time, setTime,
                    isRunning, setIsRunning,
                    actualStartTime, setActualStartTime
                }} />
            </main>
        </div>
    )
}