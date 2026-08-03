import "./GroupGoalAchievement.css"

export default function GroupGoalAchievement({
    groups = [],
    loading = false
}) {
    const sortedGroups = [...groups].sort((first, second) => {
        const firstRate = Number(first.averageGoalAchievementRate) || 0
        const secondRate = Number(second.averageGoalAchievementRate) || 0
        return secondRate - firstRate
    })

    if (loading) {
        return (
            <section className="groupAchievementCard">
                <h2 className="groupAchievementTitle">그룹 목표 달성률</h2>
                <p className="groupAchievementMessage">그룹 통계를 불러오는 중입니다.</p>
            </section>
        )
    }

    if (sortedGroups.length === 0) {
        return (
            <section className="groupAchievementCard">
                <h2 className="groupAchievementTitle">그룹 목표 달성률</h2>
                <p className="groupAchievementMessage">조회된 그룹이 없습니다.</p>
            </section>
        )
    }

    return (
        <section className="groupAchievementCard">
            <h2 className="groupAchievementTitle">그룹 목표 달성률</h2>
            <div className="groupAchievementList">
                {sortedGroups.map((group, index) => {
                    const rawRate =
                        Number(
                            group.averageGoalAchievementRate
                        ) || 0

                    const rate = Math.min(
                        100,
                        Math.max(0, Math.round(rawRate))
                    )

                    return (
                        <div key={group._id} className="groupAchievementItem">
                            <span
                                className="groupAchievementRank"
                                style={{
                                    backgroundColor:
                                        group.groupColor ||
                                        "#7c5cc4"
                                }}
                            >
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="groupAchievementName">
                                {group.groupName}
                            </span>

                            <div
                                className="groupAchievementTrack"
                                role="progressbar"
                                aria-label={
                                    `${group.groupName} 목표 달성률`
                                }
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-valuenow={rate}
                            >
                                <div
                                    className="groupAchievementValue"
                                    style={{
                                        width: `${rate}%`
                                    }}
                                />
                            </div>

                            <span className="groupAchievementRate">
                                {rate}%
                            </span>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}