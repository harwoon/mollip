import React, { useState, useEffect, useRef } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function MainLayout() {

    // 새로고침해도 데이터가 안 날아가도록 localStorage에서 초기값을 불러옴.
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

    // 타이머 레이아웃의 엔진
    const [actualStartTime, setActualStartTime] = useState(() => {
        const saved = localStorage.getItem("mollip_actualStartTime")
        return saved ? new Date(saved) : null
    })
    
    const expectedTimeRef = useRef(0)
    const startTimeRef = useRef(0)

    useEffect(() => {
        localStorage.setItem("mollip_selectedSubject", JSON.stringify(selectedSubject))
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

    // 과목 바뀔 시 시간 리셋 (과목이 해제될 때만 싹 비움)
    useEffect(() => {
        if (!selectedSubject) {
            setTime(0)
            setIsRunning(false)
            setActualStartTime(null)
            expectedTimeRef.current = 0
            localStorage.removeItem("mollip_selectedSubject")
            localStorage.removeItem("mollip_time")
            localStorage.removeItem("mollip_isRunning")
            localStorage.removeItem("mollip_actualStartTime")
        }
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