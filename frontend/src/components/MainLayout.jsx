import React, { useState, useEffect, useRef } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function MainLayout() {

    // 타이머 레이아웃을 위한 데이터
    const[selectedSubject, setSelectedSubject] = useState(null)
    const [time, setTime] = useState(0) 
    const [isRunning, setIsRunning] = useState(false)

    // 타이머 레이아웃의 엔진
    const [actualStartTime, setActualStartTime] = useState(null)
    const expectedTimeRef = useRef(0)
    const startTimeRef = useRef(0)

    // 과목 바뀔 시 시간 리셋
    useEffect(() => {
        setTime(0)
        setIsRunning(false)
        setActualStartTime(null)
        expectedTimeRef.current = 0
    }, [selectedSubject])

    // 타이머 레이아웃의 엔진
    useEffect(() => {
        let interval
        if (isRunning) {
            startTimeRef.current = Date.now()
            expectedTimeRef.current = time
            interval = setInterval(() => {
                const diffMs = Date.now() - startTimeRef.current
                const ticks = Math.floor(diffMs / 10)
                setTime(expectedTimeRef.current + ticks)
            }, 10)
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [isRunning])

    const location = useLocation()
    const isHomePage = location.pathname === "/home"

    const formatMiniTime = (currentTime) => {
        const hours = Math.floor(currentTime / 360000)
        const minutes = Math.floor((currentTime % 360000) / 6000)
        const seconds = Math.floor((currentTime % 6000) / 100)
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    

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