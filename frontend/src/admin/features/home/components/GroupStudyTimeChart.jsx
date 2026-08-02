import { useMemo } from "react"
import {Cell,Pie,PieChart,ResponsiveContainer,Tooltip,} from "recharts"

import "./GroupStudyTimeChart.css"

function formatStudyTime(totalSeconds) {
    const seconds = Number(totalSeconds) || 0

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor(
        (seconds % 3600) / 60,
    )

    if (hours === 0) {
        return `${minutes}분`
    }

    if (minutes === 0) {
        return `${hours.toLocaleString()}시간`
    }

    return `${hours.toLocaleString()}시간 ${minutes}분`
}

function GroupStudyTooltip({
    active,
    payload,
}) {
    if (!active || !payload?.length) {
        return null
    }

    const group = payload[0].payload

    return (
        <div className="groupStudyTooltip">
            <strong>{group.name}</strong>

            <p>
                공부시간:{" "}
                {formatStudyTime(group.value)}
            </p>

            <p>
                공부한 사용자:{" "}
                {group.studyUserCount}명
            </p>
        </div>
    )
}

export default function GroupStudyTimeChart({
    summary,
    loading,
    error,
}) {
    const chartData = useMemo(() => {
        const groupStatistics =
            Array.isArray(summary?.groupStatistics)
                ? summary.groupStatistics
                : []

        return groupStatistics
            .map((group) => ({
                id: group.groupId,
                name:
                    group.groupName ||
                    "이름 없는 그룹",
                value:
                    Number(
                        group.totalStudyTime,
                    ) || 0,
                color:
                    group.groupColor ||
                    "#999999",
                memberCount:
                    Number(
                        group.memberCount,
                    ) || 0,
                studyUserCount:
                    Number(
                        group.studyUserCount,
                    ) || 0,
            }))
            .filter((group) => group.value > 0)
    }, [summary])

    const calculatedTotal = chartData.reduce(
        (total, group) =>
            total + group.value,
        0,
    )

    const totalStudyTime =
        Number(
            summary?.allGroupsTotalStudyTime,
        ) || calculatedTotal

    if (loading) {
        return (
            <section className="groupStudyPanel">
                <p>
                    그룹 공부시간을 불러오는
                    중입니다.
                </p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="groupStudyPanel">
                <p className="groupStudyError">
                    {error}
                </p>
            </section>
        )
    }

    return (
        <section className="groupStudySection">
            <article className="groupStudyPanel">
                <h3>그룹별 전체 공부시간</h3>

                {chartData.length === 0 ? (
                    <p className="groupStudyEmpty">
                        이번 주 공부 기록이
                        없습니다.
                    </p>
                ) : (
                    <div className="groupStudyContent">
                        <div className="groupDonutWrapper">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        stroke="none"
                                    >
                                        {chartData.map(
                                            (group) => (
                                                <Cell
                                                    key={
                                                        group.id
                                                    }
                                                    fill={
                                                        group.color
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>

                                    <Tooltip
                                        content={
                                            <GroupStudyTooltip />
                                        }
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="groupDonutCenter">
                                <span>전체</span>

                                <strong>
                                    {formatStudyTime(
                                        totalStudyTime,
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="groupStudyLegend">
                            {chartData.map(
                                (group) => {
                                    const percent =
                                        totalStudyTime >
                                            0
                                            ? Math.round(
                                                (group.value /
                                                    totalStudyTime) *
                                                100,
                                            )
                                            : 0

                                    return (
                                        <div
                                            key={
                                                group.id
                                            }
                                            className="groupStudyLegendItem"
                                        >
                                            <span
                                                className="groupStudyLegendColor"
                                                style={{
                                                    backgroundColor:
                                                        group.color,
                                                }}
                                            />

                                            <span className="groupStudyLegendName">
                                                {
                                                    group.name
                                                }
                                            </span>

                                            <span className="groupStudyLegendValue">
                                                {formatStudyTime(
                                                    group.value,
                                                )}{" "}
                                                (
                                                {
                                                    percent
                                                }
                                                %)
                                            </span>
                                        </div>
                                    )
                                },
                            )}
                        </div>
                    </div>
                )}
            </article>

            {/* <article className="weeklyTotalStudyCard">
                <div className="weeklyTotalStudyIcon">
                    ⏱
                </div>

                <div>
                    <p>이번 주 총 공부시간</p>

                    <strong>
                        {formatStudyTime(
                            totalStudyTime,
                        )}
                    </strong>

                    <small>
                        {summary?.startDate} ~{" "}
                        {summary?.endDate}
                    </small>
                </div>
            </article> */}
        </section>
    )
}