import React, { useState, useEffect } from "react"
import { API_URL } from "../../../../config/apiUrl.js"
import { getTotalStudyTime, getTotalStudyRecord, getTodoTrend } from "../api/user.js"

export default function UserDetailInfo({ user }) {
    const [weeklyTime, setWeeklyTime] = useState(0)
    const [totalTime, setTotalTime] = useState(0)
    const [weeklyTodoRate, setWeeklyTodoRate] = useState(0) 

    useEffect(() => {
        if (!user || !user._id) return

        const fetchStudyTimes = async () => {
            try {
                const curr = new Date()
                const today = curr.toISOString().split("T")[0]
                
                const day = curr.getDay()
                const diffToMonday = day === 0 ? -6 : 1 - day
                
                const monday = new Date(curr)
                monday.setDate(curr.getDate() + diffToMonday)
                
                const sunday = new Date(monday)
                sunday.setDate(monday.getDate() + 6)
                
                const start = monday.toISOString().split("T")[0]
                const end = sunday.toISOString().split("T")[0]

                const [weeklyData, totalData, todoData] = await Promise.all([
                    getTotalStudyTime(today, user._id),
                    getTotalStudyRecord(user._id),
                    getTodoTrend("weekly", start, end, user._id) 
                ])

                setWeeklyTime(weeklyData)
                setTotalTime(totalData) 

                const rate = todoData?.data?.[0]?.achievementRate || 0
                setWeeklyTodoRate(rate)

            } catch (error) {
                console.error("데이터 연동 실패:", error)
            }
        }

        fetchStudyTimes()
    }, [user])

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        if (h > 0) return `${h}시간 ${m}분`
        return `${m}분`
    }

    if (!user) return null

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <img
                        src={user.profileImg ? `${API_URL}${user.profileImg}` : "/images/noprofile.png"}
                        alt="프로필 이미지"
                        style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#eee", objectFit: "cover" }}
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/images/noprofile.png";
                        }}
                    />
                    <div>
                        <h3 style={{ margin: "0 0 5px 0" }}>
                            {user.nickname}
                            <span style={{ fontSize: "0.8rem", color: user.isStudying ? "green" : "gray", marginLeft: "10px" }}>
                                {user.isStudying ? "활동(공부중)" : "휴식중"}
                            </span>
                        </h3>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                            가입일: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ko-KR") : "정보 없음"}<br />
                            소속 그룹: {user.group ? user.group.groupName : "없음"}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "30px", textAlign: "center" }}>
                    <div>
                        <p style={{ margin: "0 0 5px 0", fontSize: "0.9rem", color: "#666" }}>연속 학습일</p>
                        <strong style={{ fontSize: "1.2rem" }}>{user.currentStreak || 0}일</strong>
                    </div>
                    <div>
                        <p style={{ margin: "0 0 5px 0", fontSize: "0.9rem", color: "#666" }}>이번 주 공부시간</p>
                        <strong style={{ fontSize: "1.2rem" }}>
                            {formatTime(weeklyTime)}
                        </strong>
                    </div>
                    <div>
                        <p style={{ margin: "0 0 5px 0", fontSize: "0.9rem", color: "#666" }}>목표 달성률</p>
                        <strong style={{ fontSize: "1.2rem" }}>{weeklyTodoRate}%</strong>
                    </div>
                </div>
            </div>

            <div style={{ border: "1px solid #eee", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 15px 0" }}>기본 정보</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.95rem" }}>
                    <li style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666" }}>이메일</span>
                        <span>{user.email || "정보 없음"}</span>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666" }}>최근 공부일(마지막 공부일)</span>
                        <span>{user.lastStudyDate ? new Date(user.lastStudyDate).toLocaleDateString("ko-KR") : "기록 없음"}</span>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666" }}>전체 누적 공부시간</span>
                        <span>{formatTime(totalTime)}</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}