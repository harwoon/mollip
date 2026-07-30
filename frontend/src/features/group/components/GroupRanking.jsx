import { useState, useEffect } from "react"
import { getWeeklyGroupRanking } from "../api/groupRanking"

export default function GroupRanking() {
    const [ranking, setRanking] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState("")

    function formatStudyTime(totalMinutes) {
        const hours = Math.floor(
            (Number(totalMinutes) || 0) / 60,
        )

        return `${hours}시간`
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
            <p>주간 랭킹을 불러오는 중...</p>
        )
    }

    if (error) {
        return <p>{error}</p>
    }

    const currentUserId = localStorage.getItem("userId")

    const currentUserIndex = ranking.findIndex(
        (user) =>
            String(user.userId) ===
            String(currentUserId),
    )

    const startIndex = Math.max(
        currentUserIndex - 1,
        0,
    )

    const endIndex = Math.min(
        currentUserIndex + 2,
        ranking.length,
    )

    const visibleRanking =
        currentUserIndex === -1
            ? []
            : ranking.slice(startIndex, endIndex)

    return (
        <section className={styles.rankingCard}>
            <h2>이번 주 그룹 랭킹</h2>

            {ranking.length === 0 ? (
                <p>
                    표시할 랭킹이 없습니다.
                </p>
            ) : (
                <ol className={styles.rankingList}>
                    {visibleRanking.map((user, index) => (
                        <li
                            key={user.userId}
                            className={styles.rankingItem}
                        >
                            <strong className={styles.rank}>
                                {startIndex + index + 1}위
                            </strong>

                            <img
                                className={styles.profileImage}
                                src={
                                    user.image
                                        ? `${API_URL}${user.image}`
                                        : "/images/default-profile.png"
                                }
                                alt={`${user.nickname} 프로필`}
                            />

                            <span className={styles.nickname}>
                                {user.nickname}
                            </span>

                            <span className={styles.studyTime}>
                                {formatStudyTime(
                                    user.totalStudyTime,
                                )}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}