import React, { useState, useEffect } from "react"
import { getStudyTrend } from "../api/user.js"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import styles from "./TotalStudy.module.css" 


export default function SubjectRecord({ type, start, end, userId }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStudyData = async () => {
            setLoading(true)
            try {
                if (start && end && userId) {
                    const record = await getStudyTrend(type, start, end, userId)
                    setData(record.data || [])
                }
            } catch (error) {
                console.error("공부 시간 추이 조회 실패:", error)
                setData([])
            } finally {
                setLoading(false)
            }
        };

        fetchStudyData()
    }, [type, start, end, userId])

    if (loading) {
        return (
            <div className="app-modal-state">
                <div className="app-spinner" aria-hidden="true" />
                <p>공부시간 추이를 불러오는 중입니다.</p>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="app-empty">
                해당 기간의 공부 기록이 없습니다.
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
                    <h3>총 공부 시간 추이</h3>
                    <p>선택한 기간의 공부시간 변화를 확인합니다.</p>
                </div>
            </div>

            <div className={styles.chart}>
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <LineChart
                        data={data}
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
                            tick={{
                                fill: "var(--chart-axis)",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            formatter={(value) => [
                                `${value}분`,
                                "공부 시간",
                            ]}
                            labelStyle={{
                                color: "var(--color-text)",
                                fontWeight: "700",
                                marginBottom: "5px",
                            }}
                            contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid var(--color-border)",
                                boxShadow:
                                    "var(--shadow-card)",
                            }}
                        />

                        <Line
                            type="monotone"
                            dataKey="studyTime"
                            stroke="var(--chart-primary)"
                            strokeWidth={3}
                            dot={{
                                r: 4,
                                fill: "var(--chart-primary)",
                                strokeWidth: 2,
                                stroke: "#fff",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}