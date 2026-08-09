import React, { useState, useEffect } from "react"
import { getProfileImageUrl } from "../../../../util/profileImage.js"
import { getTotalStudyTime, getTotalStudyRecord, getTodoTrend } from "../api/user.js"
import styles from "./UserDetailInfo.module.css" 


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
        <section className={styles.infoCard}>
            <div className={styles.summaryRow}>
                <div className={styles.profileArea}>
                    <img
                        src={getProfileImageUrl(
                            user.profileImg,
                        )}
                        alt="프로필 이미지"
                        className={styles.profileImage}
                        onError={(event) => {
                            event.currentTarget.onerror =
                                null

                            event.currentTarget.src =
                                "/images/noprofile.png"
                        }}
                    />

                    <div className={styles.profileText}>
                        <div className={styles.nameRow}>
                            <h3>{user.nickname}</h3>

                            <span
                                className={
                                    user.isStudying
                                        ? styles.statusStudying
                                        : styles.statusResting
                                }
                            >
                                {user.isStudying ? "공부중" : "휴식중"}
                            </span>
                        </div>

                        <p>
                            가입일{" "}
                            {user.createdAt
                                ? new Date(
                                    user.createdAt,
                                ).toLocaleDateString(
                                    "ko-KR",
                                )
                                : "정보 없음"}
                        </p>

                        <p>
                            소속 그룹{" "}
                            <strong>
                                {user.group
                                    ? user.group.groupName
                                    : "없음"}
                            </strong>
                        </p>
                    </div>
                </div>

                <div className={styles.metricGrid}>
                    <div className={styles.metricItem}>
                        <span>연속 학습일</span>
                        <strong>
                            {user.currentStreak || 0}
                            <small>일</small>
                        </strong>
                    </div>

                    <div className={styles.metricItem}>
                        <span>이번 주 공부시간</span>
                        <strong>
                            {formatTime(weeklyTime)}
                        </strong>
                    </div>

                    <div className={styles.metricItem}>
                        <span>Todo 달성률</span>
                        <strong>
                            {weeklyTodoRate}
                            <small>%</small>
                        </strong>
                    </div>
                </div>
            </div>

            <div className={styles.basicInfo}>
                <h4>기본 정보</h4>

                <dl className={styles.infoList}>
                    <div>
                        <dt>이메일</dt>
                        <dd>
                            {user.email || "정보 없음"}
                        </dd>
                    </div>

                    <div>
                        <dt>최근 공부일</dt>
                        <dd>
                            {user.lastStudyDate
                                ? new Date(
                                    user.lastStudyDate,
                                ).toLocaleDateString(
                                    "ko-KR",
                                )
                                : "기록 없음"}
                        </dd>
                    </div>

                    <div>
                        <dt>전체 누적 공부시간</dt>
                        <dd>
                            {formatTime(totalTime)}
                        </dd>
                    </div>
                </dl>
            </div>
        </section>
    )
}