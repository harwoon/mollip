import { useState, useEffect, useRef } from "react"
import { getWeeklyGroupRanking } from "../api/groupRanking.js"
import styles from "./GroupRanking.module.css"

const API_URL = import.meta.env.VITE_LOCAL_API_URL

export default function GroupRanking() {
    const [ranking, setRanking] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // 전체 랭킹 스크롤 영역
    const rankingContainerRef = useRef(null)

    // 현재 로그인한 사용자의 li 요소
    const currentUserRef = useRef(null)

    const currentUserId =
        localStorage.getItem("userId")

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

    // 랭킹 조회 후 현재 사용자의 위치로 스크롤
    useEffect(() => {
        const container =
            rankingContainerRef.current

        const currentUserElement =
            currentUserRef.current

        if (!container || !currentUserElement) {
            return
        }

        const targetScrollTop =
            currentUserElement.offsetTop -
            container.clientHeight / 2 +
            currentUserElement.clientHeight / 2

        container.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
        })
    }, [ranking])

    if (loading) {
        return (
            <p>주간 랭킹을 불러오는 중...</p>
        )
    }

    if (error) {
        return <p>{error}</p>
    }

    // 이미 서버에서 순위대로 정렬되어 있다는 전제
    const topThreeRanking = ranking.slice(0, 3)

    return (
        <section className={styles.rankingCard}>
            <h2>이번 주 그룹 랭킹</h2>

            {ranking.length === 0 ? (
                <p>표시할 랭킹이 없습니다.</p>
            ) : (
                <>
                    {/* TOP 3 영역 */}
                    <div className={styles.topThreeSection}>
                        <h3>TOP 3</h3>

                        <ol className={styles.topThreeList}>
                            {topThreeRanking.map(
                                (user, index) => {
                                    const isCurrentUser =
                                        String(user.userId) ===
                                        String(currentUserId)

                                    return (
                                        <li
                                            key={user.userId}
                                            className={`${styles.topThreeItem} ${isCurrentUser
                                                    ? styles.currentUser
                                                    : ""
                                                }`}
                                        >
                                            <strong
                                                className={
                                                    styles.topRank
                                                }
                                            >
                                                {index + 1}위
                                            </strong>

                                            <img
                                                className={
                                                    styles.topProfileImage
                                                }
                                                src={
                                                    user.profileImg
                                                        ? `${API_URL}${user.profileImg}`
                                                        : "/images/noprofile.png"
                                                }
                                                alt={`${user.nickname} 프로필`}
                                            />

                                            <span
                                                className={
                                                    styles.nickname
                                                }
                                            >
                                                {user.nickname}
                                            </span>

                                            <span
                                                className={
                                                    styles.studyTime
                                                }
                                            >
                                                {formatStudyTime(
                                                    user.totalStudyTime,
                                                )}
                                            </span>
                                        </li>
                                    )
                                },
                            )}
                        </ol>
                    </div>

                    {/* 전체 그룹 랭킹 영역 */}
                    <div className={styles.allRankingSection}>
                        <h3>전체 그룹 랭킹</h3>

                        <div
                            ref={rankingContainerRef}
                            className={
                                styles.rankingScrollContainer
                            }
                        >
                            <ol
                                className={
                                    styles.rankingList
                                }
                            >
                                {ranking.map(
                                    (user, index) => {
                                        const isCurrentUser =
                                            String(
                                                user.userId,
                                            ) ===
                                            String(
                                                currentUserId,
                                            )

                                        return (
                                            <li
                                                key={
                                                    user.userId
                                                }
                                                ref={
                                                    isCurrentUser
                                                        ? currentUserRef
                                                        : null
                                                }
                                                className={`${styles.rankingItem} ${isCurrentUser
                                                        ? styles.currentUser
                                                        : ""
                                                    }`}
                                            >
                                                <strong
                                                    className={
                                                        styles.rank
                                                    }
                                                >
                                                    {index +
                                                        1}
                                                    위
                                                </strong>

                                                <img
                                                    className={
                                                        styles.profileImage
                                                    }
                                                    src={
                                                        user.profileImg
                                                            ? `${API_URL}${user.profileImg}`
                                                            : "/images/noprofile.png"
                                                    }
                                                    alt={`${user.nickname} 프로필`}
                                                />

                                                <span
                                                    className={
                                                        styles.nickname
                                                    }
                                                >
                                                    {
                                                        user.nickname
                                                    }

                                                    {isCurrentUser && (
                                                        <span
                                                            className={
                                                                styles.meBadge
                                                            }
                                                        >
                                                            나
                                                        </span>
                                                    )}
                                                </span>

                                                <span
                                                    className={
                                                        styles.studyTime
                                                    }
                                                >
                                                    {formatStudyTime(
                                                        user.totalStudyTime,
                                                    )}
                                                </span>
                                            </li>
                                        )
                                    },
                                )}
                            </ol>
                        </div>
                    </div>
                </>
            )}
        </section>
    )
}