import React, { useState, useEffect } from 'react'
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
                const formattedChartData = subjects.map((subject) => ({
                    name: subject.studyTitle,
                    // 🌟 1. 분(Minute) 단위이므로 60으로 나누어 '시간' 높이로 맞춥니다.
                    hours: Number((subject.sumStudyTime / 60).toFixed(1)),
                    color: subject.subjectColor,
                    // 🌟 2. 헷갈리지 않게 변수명을 rawMinutes로 변경합니다.
                    rawMinutes: subject.sumStudyTime,
                }))

                setChartData(formattedChartData)
            } catch (error) {
                console.error("과목 공부 시간을 가져오는데 실패했습니다:", error)
            }
        };

        fetchData()
    }, [selectedDate, type])


    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { name, rawMinutes } = payload[0].payload
            
            // 🌟 3. 분을 60으로 나누어 시간(h)과 나머지 분(m)을 정확히 구합니다.
            const h = Math.floor(rawMinutes / 60)
            const m = rawMinutes % 60

            return (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.08)'
                }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#8a6bc7' }}>{name}</p>
                    <p style={{ margin: 0, color: '#333' }}>{h}시간 {m}분</p>
                </div>
            );
        }
        return null
    };

    return (
        <div style={{ width: '100%', padding: '20px', backgroundColor: '#fcfbf9', borderRadius: '20px' }}>

            <h3 style={{ color: '#333', fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}>
                과목별 공부 시간 비교
            </h3>

            {chartData.length > 0 ? (
                <div style={{ width: '100%', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                            barSize={30}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />

                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888', fontSize: 12 }}
                                dy={10}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888', fontSize: 12 }}
                            />

                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f0fa' }} />

                            <Bar dataKey="hours" radius={[10, 10, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: '#aaa', marginTop: '40px' }}>공부 기록이 없습니다.</p>
            )}

        </div>
    )
}