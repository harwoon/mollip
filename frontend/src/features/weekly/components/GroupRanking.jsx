import { useState, useEffect } from "react"
import { getWeeklyGroupRanking } from "../api/groupRanking.js"
import { getProfileImageUrl } from "../../../util/profileImage.js"

import styles from "./GroupRanking.module.css"

export default function GroupRanking() {
    const [ranking, setRanking] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState("")

    function formatStudyTime(rawSeconds) {
        const totalMinutes = Math.floor((Number(rawSeconds) || 0) / 60)

        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60

        if (hours === 0 && minutes === 0) return "0M"
        if (hours === 0) return `${minutes}M`
        if (minutes === 0) return `${hours}H`

        return `${hours}H ${minutes}M`
    }

    useEffect(() => {
        async function fetchRanking() {
            try {
                setLoading(true)
                setError("")

                const rankingData =
                    await getWeeklyGroupRanking()


                setRanking(rankingData)
            } catch (error) {
                console.error(
                    "주간 랭킹 조회 실패:",
                    error,
                )

                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchRanking()
    }, [])

    if (loading) {
        return (
            <p className={styles.stateMessage}>주간 랭킹을 불러오는 중...</p>
        )
    }

    if (error) {
        return <p className={`${styles.stateMessage} ${styles.errorMessage}`}>{error}</p>
    }


    const currentUserId = localStorage.getItem("userId")

    const currentUserIndex = ranking.findIndex(
        (user) =>
            String(user.userId) ===
            String(currentUserId),
    )



    let startIndex

    // 현재 사용자가 1위인 경우
    if (currentUserIndex === 0) {
        startIndex = 0
    }
    // 현재 사용자가 꼴찌인 경우
    else if (
        currentUserIndex === ranking.length - 1
    ) {
        startIndex = Math.max(
            ranking.length - 3,
            0,
        )
    }
    // 그 외에는 위 1명부터 시작
    else {
        startIndex = currentUserIndex - 1
    }

    const endIndex = Math.min(
        startIndex + 3,
        ranking.length,
    )

    const visibleRanking =
        currentUserIndex === -1
            ? []
            : ranking.slice(
                startIndex,
                endIndex,
            )

    return (
        <section className={styles.rankingContainer}>
            {ranking.length === 0 ? (
                <p className={styles.stateMessage}>표시할 랭킹이 없습니다.</p>
            ) : (
                <ol className={styles.rankingList}>
                    {visibleRanking.map(
                        (user, index) => {

                            const isCurrentUser = String(user.userId) === String(currentUserId)

                            return (
                                <li key={user.userId}
                                    className={`${styles.rankingItem} ${isCurrentUser ? styles.currentUser : ""}`}
                                >
                                    <strong className={styles.rank}>
                                        {startIndex + index + 1}
                                    </strong>

                                    <img
                                        className={styles.profileImage}
                                        src={getProfileImageUrl(
                                            user.profileImg,
                                        )}
                                        alt={`${user.nickname} 프로필`}
                                        onError={(event) => {
                                            event.currentTarget.onerror =
                                                null

                                            event.currentTarget.src =
                                                "/images/noprofile.png"
                                        }}
                                    />


                                    <span className={styles.nickname}>{user.nickname}</span>
                                    <span className={styles.studyTime}>
                                        {formatStudyTime(user.totalStudyTime)}
                                    </span>
                                </li>
                            )
                        }
                    )}
                </ol>
            )}
        </section>
    )
}