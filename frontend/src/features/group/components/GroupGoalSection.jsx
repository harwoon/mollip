import { useEffect, useState } from "react"
import { RiTargetFill } from "react-icons/ri"

import {
    fetchMyWeeklyGroupGoals
} from "../api/groupGoalApi.js"

import GroupGoalItem from "./GroupGoalItem.jsx"
import OverallAchievement from "./OverallAchievement.jsx"

import styles from "./GroupGoalSection.module.css"


export default function GroupGoalSection() {
    const [goalData, setGoalData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let isMounted = true

        async function loadGroupGoals() {
            try {
                setLoading(true)
                setError("")

                const data = await fetchMyWeeklyGroupGoals()

                if (isMounted) {
                    setGoalData(data)
                }
            } catch (error) {
                if (isMounted) {
                    setError(
                        error.message ||
                        "그룹 목표를 불러오지 못했습니다."
                    )
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadGroupGoals()

        return () => {
            isMounted = false
        }
    }, [])

    if (loading) {
        return (
            <div className={styles.stateBox}>
                <p className={styles.stateMessage}>
                    그룹 목표를 불러오는 중입니다.
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.stateBox}>
                <p
                    className={`
                        ${styles.stateMessage}
                        ${styles.errorMessage}
                    `}
                >
                    {error}
                </p>
            </div>
        )
    }

    if (!goalData) {
        return (
            <div className={styles.stateBox}>
                <p className={styles.stateMessage}>
                    그룹 목표 정보가 없습니다.
                </p>
            </div>
        )
    }

    const {
        group,
        goals = [],
        overallAchievementRate = 0,
        weekStartDate,
        weekEndDate
    } = goalData

    const groupColor = group?.groupColor || "#dd6262"

    return (
        <div className={styles.section}>
            <header className={styles.header}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    
                    <div
                        style={{
                            minWidth: "36px",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: groupColor, // 그룹 컬러에 맞춰 변경됨!
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#ffffff", // 아이콘 색상 (흰색)
                            marginTop: "2px"
                        }}
                    >
                        <RiTargetFill size={22} />
                    </div>

                    {/* 기존 텍스트 영역 */}
                    <div className={styles.titleArea}>
                        <h2 className={styles.title} style={{ margin: 0 }}>
                            그룹별 목표
                        </h2>

                        <p className={styles.description}>
                            {group?.groupName || "현재"} 그룹의
                            이번 주 목표
                        </p>

                        <span className={styles.week}>
                            {weekStartDate} ~ {weekEndDate}
                        </span>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.goalList}>
                    {goals.length === 0 ? (
                        <p className={styles.emptyMessage}>
                            등록된 그룹 목표가 없습니다.
                        </p>
                    ) : (
                        goals.map((goal) => (
                            <GroupGoalItem
                                key={goal.goalType}
                                goal={goal}
                                color={groupColor}
                            />
                        ))
                    )}
                </div>

                <div className={styles.achievementArea}>
                    <OverallAchievement
                        achievementRate={
                            overallAchievementRate
                        }
                        color={groupColor}
                    />
                </div>
            </div>
        </div>
    )
}