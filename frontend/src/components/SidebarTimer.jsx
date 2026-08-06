import React, { memo } from "react"
import { useLocation } from "react-router-dom" // 현재 주소 확인용 불러오기
import { useTimer } from "../context/TimerContext"

function SidebarTimer() {
    const { isRunning, selectedSubject, time } = useTimer()
    const location = useLocation() // 현재 주소 가져오기

    // 홈 화면이거나 타이머가 안 돌면 사이드바 숨김
    if (location.pathname === "/home" || !isRunning || !selectedSubject) {
        return null
    }

    return (
        <div className="sidebarTimer">
            <p className="sidebarTimerSubject">
                {/* <span aria-hidden="true">🔥</span> */}
                {selectedSubject.subjectName} 공부 중
            </p>

            <strong className="sidebarTimerTime">
                {formatMiniTime(time)}
            </strong>
        </div>
    )
}

const formatMiniTime = (currentTime) => {
    if (currentTime === undefined || currentTime === null) return "00:00:00"
    const hours = Math.floor(currentTime / 360000)
    const minutes = Math.floor((currentTime % 360000) / 6000)
    const seconds = Math.floor((currentTime % 6000) / 100)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default memo(SidebarTimer)