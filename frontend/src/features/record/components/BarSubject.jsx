import React, { useState, useEffect, useMemo } from 'react'
import { getSubjectRecord } from '../api/study.js'
import dayjs from 'dayjs'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer
} from 'recharts'

import styles from "./BarSubject.module.css"

export default function SubjectBarChart({ selectedDate, type }) {
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD')
                const data = await getSubjectRecord(type, formattedDate)

                const subjects = data.subjects || []

                // Recharts BarChart에 사용할 데이터로 변환
                const formattedChartData = subjects.map((subject) => ({
                    name: subject.studyTitle,
                    hours: Number((subject.sumStudyTime / 3600).toFixed(2)),
                    color: subject.subjectColor,
                    rawSeconds: subject.sumStudyTime,
                }))

                setChartData(formattedChartData)
            } catch (error) {
                console.error("과목 공부 시간을 가져오는데 실패했습니다:", error)

                setChartData([])
            }
        }

        fetchData()
    }, [selectedDate, type])

    // 실제 공부 기록이 있는지 확인
    const hasChartData = chartData.length > 0


    // Recharts에 전달할 최종 차트 데이터
    const displayChartData = useMemo(() => {
        if (hasChartData) {
            return chartData
        }

        return [
            {
                name: "기록 없음",
                hours: 0,
                color: "var(--color-border)",
                rawSeconds: 0
            }
        ]
    }, [chartData, hasChartData])


    // 막대 차트 Tooltip
    const CustomTooltip = ({
        active,
        payload
    }) => {
        // 실제 공부 기록이 없으면 Tooltip 표시 안 함
        if (!hasChartData) {
            return null
        }

        if (
            active &&
            payload &&
            payload.length
        ) {
            const {
                name,
                rawSeconds
            } = payload[0].payload

            const totalMinutes = Math.floor(rawSeconds / 60)

            const hour = Math.floor(totalMinutes / 60)
            const min = totalMinutes % 60

            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipTitle}>{name}</p>
                    <p className={styles.tooltipTime}>{hour}시간 {min}분</p>
                </div>
            )
        }

        return null
    }


    return (
        <section className={`commonSection ${styles.container}`}>
            <h3 className={styles.title}>과목별 공부 시간 비교</h3>

            <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={displayChartData}
                        margin={{
                            top: 20,
                            right: 20,
                            left: -20,
                            bottom: 0
                        }}
                        barSize={30}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#eeeeee"
                        />

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#888888",
                                fontSize: 12
                            }}
                            dy={10}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#888888",
                                fontSize: 12
                            }}
                            domain={[0, "auto"]}
                        />

                        {hasChartData && (
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{
                                    fill: "#f4f0fa"
                                }}
                            />
                        )}

                        <Bar
                            dataKey="hours"
                            radius={[10, 10, 0, 0]}
                            minPointSize={0}
                        >
                            {displayChartData.map(
                                (entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                )
                            )}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                {!hasChartData && (
                    <div className={styles.emptyState}>
                        <span>과목별 공부 기록</span>
                        <strong>없음</strong>
                    </div>
                )}
            </div>
        </section>
    )
}