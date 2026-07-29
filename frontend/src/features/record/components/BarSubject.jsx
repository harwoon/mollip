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
                    // '시간' 높이
                    hours: Number((subject.sumStudyTime / 60).toFixed(1)),
                    color: subject.subjectColor,
                    rawMinutes: subject.sumStudyTime,
                }))

                setChartData(formattedChartData)
            } catch (error) {
                console.error("과목 공부 시간을 가져오는데 실패했습니다:", error)

                // 조회 실패 시 차트 초기화
                setChartData([])
            }
        }

        fetchData()
    }, [selectedDate, type])

    // 실제 공부 기록이 있는지 확인
    const hasChartData = chartData.length > 0


    // Recharts에 전달할 최종 차트 데이터
    const displayChartData = useMemo(() => {
        // 실제 공부 기록이 있으면 그대로 사용
        if (hasChartData) {
            return chartData
        }

        /*
            공부 기록이 없더라도 차트 영역과 축이 보이도록
            높이 0인 임시 데이터를 넣는다.
        */
        return [
            {
                name: "기록 없음",
                hours: 0,
                color: "#ddd8e8",
                rawMinutes: 0
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
                rawMinutes
            } = payload[0].payload

            // 전체 분을 시간과 분으로 변환
            const hour = Math.floor(rawMinutes / 60)
            const min = rawMinutes % 60

            return (
                <div
                    style={{
                        padding: "12px",
                        backgroundColor: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow:
                            "0px 4px 12px rgba(0, 0, 0, 0.08)"
                    }}
                >
                    <p
                        style={{
                            margin: "0 0 5px 0",
                            color: "#8a6bc7",
                            fontWeight: "bold"
                        }}
                    >
                        {name}
                    </p>

                    <p
                        style={{
                            margin: 0,
                            color: "#333333"
                        }}
                    >
                        {hour}시간 {min}분
                    </p>
                </div>
            )
        }

        return null
    }


    return (
        <div
            style={{
                width: "100%",
                padding: "20px",
                backgroundColor: "#fcfbf9",
                borderRadius: "20px"
            }}
        >
            <h3
                style={{
                    marginBottom: "20px",
                    color: "#333333",
                    fontSize: "1.2rem",
                    textAlign: "center"
                }}
            >
                과목별 공부 시간 비교
            </h3>


            {/* Recharts 막대 차트 영역 */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "250px"
                }}
            >
                {/* 부모 크기에 맞춰 차트 크기 자동 조절 */}
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
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
                        {/* 가로 기준선 */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#eeeeee"
                        />

                        {/* 과목명 X축 */}
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

                        {/* 공부시간 Y축 */}
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#888888",
                                fontSize: 12
                            }}
                            domain={[0, "auto"]}
                        />

                        {/* 실제 데이터가 있을 때만 Tooltip 표시 */}
                        {hasChartData && (
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{
                                    fill: "#f4f0fa"
                                }}
                            />
                        )}

                        {/* 과목별 공부시간 막대 */}
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


                {/* 공부 기록이 없을 때 차트 위에 안내 문구 표시 */}
                {!hasChartData && (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",

                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",

                            transform:
                                "translate(-50%, -50%)",
                            textAlign: "center",
                            pointerEvents: "none"
                        }}
                    >
                        <span
                            style={{
                                color: "#999999",
                                fontSize: "0.8rem"
                            }}
                        >
                            과목별 공부 기록
                        </span>

                        <strong
                            style={{
                                marginTop: "3px",
                                color: "#777777",
                                fontSize: "1rem"
                            }}
                        >
                            없음
                        </strong>
                    </div>
                )}
            </div>
        </div>
    )
}