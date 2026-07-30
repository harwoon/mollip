import { useState, useEffect } from "react"
import { getWeeklyGroupRanking } from "../api/groupRanking.js"


const API_URL = import.meta.env.VITE_API_URL

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

        return `${hours}H`
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

    console.log("로컬 userId:", currentUserId)
    console.log("랭킹 데이터:", ranking)
    console.log("현재 사용자 index:", currentUserIndex)

    return (
        <section >


            {ranking.length === 0 ? (
                <p>
                    표시할 랭킹이 없습니다.
                </p>
            ) : (
                <ol >
                    {visibleRanking.map((user, index) => (
                        <li
                            key={user.userId}

                        >
                            <strong >
                                {startIndex + index + 1}위
                            </strong>

                            <img

                                src={
                                    user.profileImg
                                        ? `${API_URL}${user.profileImg}`
                                        : "/images/noprofile.png"
                                }
                                alt={`${user.nickname} 프로필`}
                            />

                            <span >
                                {user.nickname}
                            </span>

                            <span >
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