import React, { useEffect, useState } from 'react'
import { getWeeklySubjectRatio } from '../api/weekly.js'
import dayjs from 'dayjs'

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

export default function SubjectStudyTimeChart({ selectedDate }) {
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const formattedDate =
                    dayjs(selectedDate).format('YYYY-MM-DD')

                const data =
                    await getWeeklySubjectRatio(formattedDate)

                const subjects = Array.isArray(data.subjects)
                    ? data.subjects
                    : []

                const formattedChartData = subjects.map(
                    (subject) => ({
                        name: subject.studyTitle,

                        // 파이 차트의 크기를 결정하는 값
                        value: Number(subject.sumStudyTime) || 0,

                        // 서버에서 계산한 비율
                        ratio: Number(subject.ratio) || 0,

                        // 툴팁에서 사용하는 분 단위 원본
                        rawMinutes:
                            Number(subject.sumStudyTime) || 0,

                        color:
                            subject.subjectColor || '#D9D9D9'
                    })
                )

                setChartData(formattedChartData)
            } catch (error) {
                console.error(
                    '주간 과목별 공부 시간을 가져오는데 실패했습니다:',
                    error
                )

                setChartData([])
            }
        }

        fetchData()
    }, [selectedDate])

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) {
            return null
        }

        const {
            name,
            rawMinutes,
            ratio,
            color
        } = payload[0].payload

        const hours = Math.floor(rawMinutes / 60)
        const minutes = rawMinutes % 60

        return (
            <div
                style={{
                    backgroundColor: '#fff',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow:
                        '0px 4px 12px rgba(0,0,0,0.08)'
                }}
            >
                <p
                    style={{
                        margin: '0 0 5px 0',
                        fontWeight: 'bold',
                        color
                    }}
                >
                    {name}
                </p>

                <p
                    style={{
                        margin: '0 0 4px 0',
                        color: '#333'
                    }}
                >
                    {hours}시간 {minutes}분
                </p>

                <p
                    style={{
                        margin: 0,
                        color: '#888',
                        fontSize: '12px'
                    }}
                >
                    전체 공부 시간의 {ratio}%
                </p>
            </div>
        )
    }

    return (
        <div
            style={{
                width: '100%',
                padding: '20px',
                boxSizing: 'border-box',
                backgroundColor: '#fcfbf9',
                borderRadius: '20px'
            }}
        >
            <h3
                style={{
                    margin: '0 0 20px 0',
                    color: '#333',
                    fontSize: '1.2rem'
                }}
            >
                주간 과목별 공부 시간
            </h3>

            {chartData.length > 0 ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '260px'
                    }}
                >
                    <div
                        style={{
                            width: '30%',
                            minWidth: '90px',
                            paddingLeft: '20px'
                        }}
                    >
                        {chartData.map((subject) => (
                            <div
                                key={subject.name}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    marginBottom: '12px'
                                }}
                            >
                                <span
                                    style={{
                                        width: '9px',
                                        height: '9px',
                                        flexShrink: 0,
                                        borderRadius: '50%',
                                        backgroundColor:
                                            subject.color
                                    }}
                                />

                                <span
                                    style={{
                                        color: '#555',
                                        fontSize: '12px'
                                    }}
                                >
                                    {subject.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            width: '70%',
                            height: '100%'
                        }}
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={90}
                                    paddingAngle={0}
                                    stroke="none"
                                >
                                    {chartData.map(
                                        (subject, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={subject.color}
                                            />
                                        )
                                    )}
                                </Pie>

                                <Tooltip
                                    content={<CustomTooltip />}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <p
                    style={{
                        margin: '40px 0',
                        textAlign: 'center',
                        color: '#aaa'
                    }}
                >
                    공부 기록이 없습니다.
                </p>
            )}
        </div>
    )
}