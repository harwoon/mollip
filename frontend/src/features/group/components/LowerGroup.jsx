import React, { useState, useEffect } from "react"
import {getLower, getWeekStudyTime} from "../api/group"

import { FiTrendingDown } from "react-icons/fi"
import styles from "./LowerGroup.module.css"

export default function LowerGroup() {
    const [groupName, setGroupName] = useState("")
    const [groupTime, setGroupTime] = useState(0)
    const [remainTime, setRemainTime] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const [lowerGroup, weeklySecondsData] = await Promise.all([
                    getLower(),
                    getWeekStudyTime()
                ])

                const lowerGroupSeconds =
                    Number(lowerGroup?.groupTime) || 0

                const currentWeeklySeconds =
                    Number(weeklySecondsData) || 0

                setGroupName(lowerGroup?.groupName || "")
                setGroupTime(lowerGroupSeconds)

                const calculatedRemainSeconds = Math.max(lowerGroupSeconds - currentWeeklySeconds, 0)

                const calculatedProgress = lowerGroupSeconds > 0 ? Math.min(
                    Math.floor(
                        (currentWeeklySeconds / lowerGroupSeconds) * 100
                    ), 100
                ) : 0

                setRemainTime(calculatedRemainSeconds)
                setProgress(calculatedProgress)

            } catch (error) {
                console.error("하위 그룹 데이터 가져오기 실패:", error)
            }
        }

        fetchGroupData()
    }, [])

    const formatStudyTime = (rawSeconds) => {
        const totalSeconds = Number(rawSeconds) || 0
        const totalMinutes = Math.floor(totalSeconds / 60)

        const hours = Math.floor(totalMinutes / 60)
        const remainMinutes = totalMinutes % 60

        if (hours === 0 && remainMinutes === 0) {
            return "0분"
        }
        if (hours === 0) {
            return `${remainMinutes}분`
        }
        if (remainMinutes === 0) {
            return `${hours}시간`
        }

        return `${hours}시간 ${remainMinutes}분`
    }

    return (
        <section className={`commonSection ${styles.container}`}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.iconBox}>
                        <FiTrendingDown aria-hidden="true" />
                    </span>

                    <div className={styles.groupInfo}>
                        <p className={styles.label}>하위 그룹</p>

                        <h2 className={styles.groupName}>
                            {groupName ||
                                "그룹명 로딩 중..."}
                        </h2>
                    </div>
                </div>

                <strong className={styles.groupTime}>
                    {formatStudyTime(groupTime)}
                </strong>
            </header>

            <div className={styles.messageArea}>
                <p className={styles.progressTitle}>
                    <strong className={styles.remainTime}>
                        {formatStudyTime(remainTime)}
                    </strong>
                    {" "}더 공부하지 않으면
                </p>

                <p className={styles.progressMessage}>하위 그룹으로 떨어질 수 있어요!</p>

                <div className={styles.progressArea}>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressValue}
                            style={{
                                width: `${progress}%`
                            }}
                        />
                    </div>

                    <span className={styles.progressPercent}>
                        {progress}%
                    </span>
                </div>
            </div>
        </section>
    )
}