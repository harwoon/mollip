import { useEffect, useState } from "react"
import { getProfileImageUrl } from "../../../../util/profileImage.js"
import { fetchAdminGroupMembers } from "../api/adminGroupStatisticsApi.js"

import styles from "./GroupMembersPanel.module.css"

export default function GroupMembersPanel({ group, onClose }) {
    const [members, setMembers] = useState([])
    const [weekRange, setWeekRange] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let cancelled = false

        async function loadMembers() {
            try {
                setLoading(true)
                setError("")
                const data = await fetchAdminGroupMembers(group._id)

                if (cancelled) return

                setMembers(Array.isArray(data.members) ? data.members : [])
                setWeekRange({
                    start: data.weekStartDate,
                    end: data.weekEndDate,
                })
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError.message)
                    setMembers([])
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadMembers()

        return () => {
            cancelled = true
        }
    }, [group._id])

    return (
        <div className={styles.panel}>
            <header className={styles.header}>
                <div>
                    <h2>{group.groupName} 회원</h2>
                    <p>
                        {weekRange?.start && weekRange?.end
                            ? `${weekRange.start} ~ ${weekRange.end}`
                            : "이번 주"} 그룹 목표 달성률
                    </p>
                </div>
                <button
                    type="button"
                    className="app-btn-secondary app-btn-small"
                    onClick={onClose}
                >
                    닫기
                </button>
            </header>

            {loading && (
                <div className={styles.state}>
                    <div className="app-spinner" aria-hidden="true" />
                    <span>회원 정보를 불러오는 중입니다.</span>
                </div>
            )}

            {!loading && error && (
                <p className={styles.error}>{error}</p>
            )}

            {!loading && !error && members.length === 0 && (
                <div className={styles.state}>소속 회원이 없습니다.</div>
            )}

            {!loading && !error && members.length > 0 && (
                <ul className={styles.memberList}>
                    {members.map((member) => {
                        const rate = Math.min(
                            Math.max(Number(member.overallAchievementRate) || 0, 0),
                            100,
                        )

                        return (
                            <li key={member._id} className={styles.memberItem}>
                                <img
                                    src={getProfileImageUrl(member.profileImg)}
                                    alt={`${member.nickname} 프로필`}
                                    className={styles.profileImage}
                                    onError={(event) => {
                                        event.currentTarget.src = "/images/noprofile.png"
                                    }}
                                />
                                <div className={styles.memberContent}>
                                    <div className={styles.memberSummary}>
                                        <strong>{member.nickname}</strong>
                                        <span>{rate.toFixed(2)}%</span>
                                    </div>
                                    <div className={styles.progressTrack}>
                                        <div
                                            className={styles.progressBar}
                                            style={{ width: `${rate}%` }}
                                        />
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
