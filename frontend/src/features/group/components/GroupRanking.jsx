import { FaCrown } from "react-icons/fa"
import { useState, useEffect, useRef } from "react"
import { getWeeklyGroupRanking } from "../api/groupRanking.js"
import { getProfileImageUrl } from "../../../util/profileImage.js"

import styles from "./GroupRanking.module.css"

export default function GroupRanking() {
    const [ranking, setRanking] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // 전체 랭킹 스크롤 영역
    const rankingContainerRef = useRef(null)

    // 현재 로그인한 사용자의 li 요소
    const currentUserRef = useRef(null)

    const currentUserId = localStorage.getItem("userId")

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

                const rankingData = await getWeeklyGroupRanking()

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
        const container = rankingContainerRef.current
        const currentUserElement = currentUserRef.current

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
            <section className={`commonSection ${styles.stateContainer}`}>
                <div className="app-modal-state">
                    <div className="app-spinner app-spinner-large" aria-hidden="true" />
                    <strong>그룹 랭킹을 불러오고 있어요</strong>
                    <p>잠시만 기다려 주세요.</p>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section
                className={`commonSection ${styles.stateContainer} ${styles.errorMessage}`}
            >
                {error}
            </section>
        )
    }

    // 이미 서버에서 순위대로 정렬되어 있다는 전제
    const topThreeRanking = ranking.slice(0, 3)

    // TOP3를 2위 / 1위 / 3위 순서로 배치
    const podiumRanking =
        topThreeRanking.length === 3
            ? [
                topThreeRanking[1],
                topThreeRanking[0],
                topThreeRanking[2],
            ]
            : topThreeRanking

    return (
        <section className={`commonSection ${styles.rankingCard}`}>
            <header className={styles.header}>
                <div className={styles.headerTitleArea}>
                    <div className={styles.headerIcon}>
                        <FaCrown size={20} />
                    </div>

                    <div>
                        <h2 className={styles.title}>이번 주 그룹 랭킹</h2>
                        <p className={styles.description}>
                            그룹원의 주간 공부시간 순위입니다.
                        </p>
                    </div>
                </div>

                <span className={styles.memberCount}>
                    총 {ranking.length}명
                </span>
            </header>

            {ranking.length === 0 ? (
                <p className={styles.emptyMessage}>표시할 랭킹이 없습니다.</p>
            ) : (
            <div className={styles.content}>

                <section className={styles.topThreeSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h3 className={styles.sectionTitle}>TOP 3</h3>
                            <p className={styles.sectionDescription}>
                                이번 주 가장 많이 공부한 그룹원이에요.
                            </p>
                        </div>
                    </div>

                    <ol className={styles.topThreeList}>
                        {podiumRanking.map((user) => {
                            const originalRank =
                                ranking.findIndex(
                                    (rankingUser) => String(
                                        rankingUser.userId
                                    ) === String(user.userId)
                                ) + 1

                            const isCurrentUser = String(user.userId) === String(currentUserId)
                            const isFirstPlace = originalRank === 1

                            return (
                                <li
                                    key={user.userId}
                                    className={`
                                        ${styles.topThreeItem}
                                        ${isFirstPlace ? styles.firstPlace : ""}
                                        ${isCurrentUser ? styles.currentUser : ""}
                                    `}
                                >
                                    {/* 순위 */}
                                    <div className={styles.topRankBadge}>
                                        <strong className={styles.topRank}>
                                            {originalRank}
                                        </strong>

                                        {isFirstPlace && (
                                            <FaCrown className={styles.topCrown}/>
                                        )}
                                    </div>

                                    {/* 프로필 */}
                                    <div className={ styles.topProfileWrap}>
                                        <img
                                            className={styles.topProfileImage}
                                            src={getProfileImageUrl(user.profileImg)}
                                            alt={`${user.nickname} 프로필`}
                                            onError={(event) => {
                                                event.currentTarget.onerror = null
                                                event.currentTarget.src = "/images/noprofile.png"
                                            }}
                                        />
                                    </div>

                                    {/* 사용자 */}
                                    <div className={styles.topUserInfo}>
                                        <span className={styles.nickname}>
                                            {user.nickname}
                                        </span>

                                        {isCurrentUser && (
                                            <span className={styles.meBadge}>나</span>
                                        )}
                                    </div>

                                    {/* 공부시간 */}
                                    <span className={styles.topStudyTime}>
                                        {formatStudyTime(user.totalStudyTime)}
                                    </span>
                                </li>
                            )
                        })}
                    </ol>
                </section>


                <section className={styles.allRankingSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h3 className={styles.sectionTitle}>전체 그룹 랭킹</h3>
                            <p className={styles.sectionDescription}>
                                내 순위는 보라색으로 표시돼요.
                            </p>
                        </div>

                        <span className={styles.scrollHint}>
                            
                        </span>
                    </div>

                    <div
                        ref={rankingContainerRef}
                        className={styles.rankingScrollContainer}
                    >
                        <ol className={styles.rankingList}>
                            {ranking.map((user, index) => {
                                const isCurrentUser = String(user.userId) === String(currentUserId)

                                return (
                                    <li
                                        key={user.userId}
                                        ref={isCurrentUser ? currentUserRef : null}
                                        className={`
                                            ${styles.rankingItem}
                                            ${isCurrentUser ? styles.currentUser : ""}
                                        `}
                                    >
                                        <strong className={styles.rank}
                                        >{index + 1}</strong>

                                        <img
                                            className={styles.profileImage}
                                            src={getProfileImageUrl(user.profileImg)}
                                            alt={`${user.nickname} 프로필`}
                                            onError={(event) => {
                                                event.currentTarget.onerror = null
                                                event.currentTarget.src = "/images/noprofile.png"
                                            }}
                                        />

                                        <div className={styles.userInfo}>
                                            <span className={styles.nickname}>
                                                {user.nickname}
                                            </span>

                                            {isCurrentUser && (
                                                <span className={styles.meBadge}
                                                >나</span>
                                            )}
                                        </div>

                                        <span className={styles.studyTime}>
                                            {formatStudyTime(
                                                user.totalStudyTime
                                            )}
                                        </span>
                                    </li>
                                )
                            })}
                        </ol>
                    </div>
                </section>
            </div>
        )}
    </section>
    )
}
