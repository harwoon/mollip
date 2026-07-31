import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getGroupStreak } from "../api/weekly.js"

import styles from "./GroupStreakChart.module.css"
import { getChartTheme } from "../../../../util/chartTheme.js"

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null

    const { name, days, color } = payload[0].payload

    const formattedDays = Number.isInteger(Number(days)) 
        ? days 
        : Number(days).toFixed(2)

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipTitle} style={{ color }}>
                {name}
            </p>
            <p className={styles.tooltipDays}>
                {formattedDays}일
            </p>
        </div>
    )
}

export default function GroupStreakChart() {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    // 차트 변수
    const chartTheme = getChartTheme()

    useEffect(() => {
        const fetchData = async () => {
        try {
            setLoading(true)

            const data = await getGroupStreak()

            setChartData([
            {
                name: "개인 공부 일수",
                days: Number(data?.userStreak) || 0,
                color: theme.colors.primary,
            },
            {
                name: "그룹 공부 일수",
                days: Number(data?.groupStreak) || 0,
                color: theme.colors.secondarySoft,
            },
            ])
        } catch (error) {
            console.error("연속 공부 달성 일수 조회 실패:", error)
            setChartData([])
        } finally {
            setLoading(false)
        }
        }

        fetchData()
    }, [])

    const maxStreak = Math.max(...chartData.map((item) => item.days), 0)

    // 기본 최대 30일이며, 30일을 넘으면 5일 단위로 증가
    const xAxisMax = Math.max(30, Math.ceil(maxStreak / 5) * 5)
    const ticks = Array.from({ length: xAxisMax / 5 + 1 }, (_, index) => index * 5)

    return (
        <section className={`commonSection ${styles.container}`}>
            <h3 className={styles.title}>연속 공부 달성 일수</h3>

            <div className={styles.legend}>
                {chartData.map((item) => (
                    <div key={item.name} className={styles.legendItem}>
                        <span className={styles.legendColor} style={{backgroundColor:item.color}}/>

                        <span className={styles.legendName}>
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>

            {loading ? (
                <p className={styles.emptyMessage}>불러오는 중입니다.</p>
            ) : chartData.length > 0 ? (
                <div className={styles.chartArea}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{
                                top: 20,
                                right: 20,
                                left: 25,
                                bottom: 10
                            }}
                            barCategoryGap={4}
                        >
                            <CartesianGrid
                                strokeDasharray="2 4"
                                vertical={false}
                                stroke={chartTheme.colors.referenceLine}
                            />

                            <XAxis
                                type="number"
                                domain={[0, xAxisMax]}
                                ticks={ticks}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: chartTheme.colors.axisStrong,
                                    fontSize: chartTheme.fontSizes.sm,
                                    fontWeight: 600
                                }}
                                tickFormatter={(value) =>
                                    value === 0 ? "일자" : `${value}일`
                                }
                            />

                            <YAxis type="category" dataKey="name" hide/>

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{fill: chartTheme.colors.cursor}}
                            />

                            <Bar
                                dataKey="days"
                                barSize={chartTheme.sizes.barSize}
                                radius={[
                                    chartTheme.sizes.barRadius,
                                    chartTheme.sizes.barRadius,
                                    chartTheme.sizes.barRadius,
                                    chartTheme.sizes.barRadius
                                ]}
                            >
                                {chartData.map(
                                    (item) => (<Cell
                                            key={item.name}
                                            fill={item.color}
                                        />
                                    )
                                )}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className={styles.emptyMessage}>연속 공부 기록이 없습니다.</p>
            )}
        </section>
    )
}