import { useEffect, useState } from "react";
import dayjs from "dayjs";

import {Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";

import { getWeeklyTodoCompare } from "../api/weekly"

import styles from "./GroupTodoAchievementChart.module.css"
import { getChartTheme } from "../../../../util/chartTheme.js"


// 툴팁
function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) {
        return null
    }

    const chartItem = payload[0].payload

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipTitle}>
                {chartItem.day}요일
            </p>

            <p className={styles.tooltipDate}>
                {dayjs(chartItem.date).format("YYYY.MM.DD")}
            </p>

            <p className={styles.tooltipPersonal}>
                개인 달성률:{" "}
                {chartItem.personalRate}%
            </p>

            <p className={styles.tooltipGroup}>
                그룹 평균 달성률:{" "}
                {chartItem.originalGroupRate}%
            </p>
        </div>
    )
}

// 범례 이름
function formatLegend(value) {
    if (value === "personalRate") {
        return "개인 달성률"
    }

    if (value === "groupRate") {
        return "그룹 평균 달성률"
    }

    return value;
}

export default function GroupTodoAchievementChart({ selectedDate }) {
    const [chartData, setChartData] = useState([]);
    
    // 차트 변수
    const chartTheme = getChartTheme()

    useEffect(() => {
        const fetchData = async () => {
        try {
            const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");

            const data = await getWeeklyTodoCompare(formattedDate);

            const records = Array.isArray(data) ? data : []

            const formattedData = records.map((record) => {
                const personalRate = Number(record.personalRate) || 0
                const originalGroupRate = Number(record.groupRate) || 0

                return {
                    date: record.date,
                    day: record.day,

                    // 개인 막대는 위쪽
                    personalRate: Math.abs(personalRate),

                    // 그룹 막대는 아래쪽
                    groupRate: -Math.abs(originalGroupRate),

                    // 툴팁에서 사용할 양수 값
                    originalGroupRate: Math.abs(originalGroupRate),
                }
            })

            setChartData(formattedData)
        } catch (error) {
            console.error("주간 Todo 달성률을 가져오는데 실패했습니다:", error)

            setChartData([])
        }
    };

    fetchData()
    }, [selectedDate])

    return (
        <section className={`commonSection ${styles.container}`}>
            <h3 className={styles.title}>목표 달성률</h3>

            {chartData.length > 0 ? (
                <div className={styles.chartArea}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            stackOffset="sign"
                            margin={{
                                top: 10,
                                right: 20,
                                left: -10,
                                bottom: 0
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke={chartTheme.colors.grid}
                            />

                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: chartTheme.colors.axisStrong,
                                    fontSize: chartTheme.fontSizes.md,
                                    fontWeight: 700
                                }}
                                dy={10}
                            />

                            <YAxis
                                domain={[-100, 100]}
                                ticks={[-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: chartTheme.colors.axis,
                                    fontSize: chartTheme.fontSizes.sm
                                }}
                                tickFormatter={(value) =>
                                    `${Math.abs(value)}%`
                                }
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{fill: chartTheme.colors.cursor}}
                            />

                            <Legend
                                verticalAlign="top"
                                align="right"
                                formatter={formatLegend}
                                wrapperStyle={{
                                    paddingBottom: "10px",
                                    fontSize: chartTheme.fontSizes.md,
                                    color: chartTheme.colors.axisStrong
                                }}
                            />

                            {/* 개인과 그룹의 기준선 */}
                            <ReferenceLine 
                                y={0}
                                stroke={chartTheme.colors.referenceLine}
                            />

                            {/* 개인 달성률 막대(위) */}
                            <Bar
                                dataKey="personalRate"
                                stackId="todo"
                                fill={chartTheme.colors.primary}
                                barSize={chartTheme.sizes.barSize}
                                radius={[
                                    chartTheme.sizes.barRadius,
                                    chartTheme.sizes.barRadius,
                                    0,
                                    0
                                ]}
                                maxBarSize={chartTheme.sizes.barSize}
                            />

                            {/* 그룹 평균 막대(아래) */}
                            <Bar
                                dataKey="groupRate"
                                stackId="todo"
                                fill={chartTheme.colors.secondarySoft}
                                barSize={chartTheme.sizes.barSize}
                                radius={[
                                    0,
                                    0,
                                    chartTheme.sizes.barRadius,
                                    chartTheme.sizes.barRadius
                                ]}
                                maxBarSize={chartTheme.sizes.barSize}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className={styles.emptyMessage}>Todo 기록이 없습니다.</p>
            )}
        </section>
    )
}
