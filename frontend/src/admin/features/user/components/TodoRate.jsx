import { useState, useEffect } from "react"
import { getTodoTrend } from "../api/user.js"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import styles from "./TodoRate.module.css" 


export default function TodoAchievementRecord({ type, start, end, userId }) {

    const [record, setRecord] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchTodoData = async () => {
            setLoading(true)
            setError("")
            try {
                const data = await getTodoTrend(type, start, end, userId)
                setRecord(data.data || [])
            } catch (err) {
                console.error("Todo 기록 조회 실패:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        };

        if (start && end && type) {
            fetchTodoData()
        }
    }, [type, start, end, userId])

    if (loading) {
        return (
            <div className="app-modal-state">
                <div className="app-spinner" aria-hidden="true" />
                <p>Todo 달성률을 불러오는 중입니다.</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                {error}
            </div>
        )
    }

    if (record.length === 0) {
        return (
            <div className="app-empty">
                해당 기간의 Todo 데이터가 없습니다.
            </div>
        )
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) {
            return null
        }

        const data = payload[0].payload

        return (
            <div className={styles.tooltip}>
                <strong>{label}</strong>
                <p className={styles.tooltipRate}>
                    달성률: {data.achievementRate}%
                </p>
                <p className={styles.tooltipMeta}>
                    완료 {data.completedCount}개 · 전체 {data.totalCount}개
                </p>
            </div>
        )
    }


    // 커스텀 X축 라벨
    const CustomXAxisTick = ({ x, y, payload }) => {
        const dateArray = payload.value.split(" ~ ")

        return (
            <g transform={`translate(${x},${y})`}>
                <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="middle"
                    fill="var(--chart-axis)"
                    fontSize={11}
                >
                    {dateArray.map((date, index) => (
                        <tspan
                            x={0}
                            dy={index === 0 ? 0 : 16}
                            key={index}
                        >
                            {date}
                            {index === 0 &&
                            dateArray.length > 1
                                ? " ~"
                                : ""}
                        </tspan>
                    ))}
                </text>
            </g>
        )
    }

    return (
        <section className={styles.chartSection}>
            <div className={styles.header}>
                <div>
                    <h3>Todo 달성률</h3>
                    <p>기간별 Todo 완료 비율을 확인합니다.</p>
                </div>
            </div>

            <div className={styles.chart}>
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={record}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="var(--chart-grid)"
                        />

                        <XAxis
                            dataKey="label"
                            interval={0}
                            tick={<CustomXAxisTick />}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            domain={[0, 100]}
                            tick={{
                                fill: "var(--chart-axis)",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) =>
                                `${value}%`
                            }
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                fill: "rgba(126, 87, 194, 0.05)",
                            }}
                        />

                        <Bar
                            dataKey="achievementRate"
                            fill="var(--chart-primary)"
                            radius={[6, 6, 0, 0]}
                            animationDuration={1000}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}