import { useEffect, useState } from "react";
import dayjs from "dayjs";

import {Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";

import { getWeeklyTodoCompare } from "../api/weekly"


// 툴팁
function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) {
        return null
    }

    const chartItem = payload[0].payload

    return (
        <div
            style={{
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
        >
        <p
            style={{
            margin: "0 0 5px",
            color: "#333",
            fontWeight: "bold",
            }}
        >
            {chartItem.day}요일
        </p>

        <p
            style={{
            margin: "0 0 5px",
            color: "#888",
            fontSize: "12px",
            }}
        >
            {dayjs(chartItem.date).format("YYYY.MM.DD")}
        </p>

        <p
            style={{
            margin: "0 0 5px",
            color: "#6f52aa",
            }}
        >
            개인 달성률: {chartItem.personalRate}%
        </p>

        <p
            style={{
            margin: 0,
            color: "#d9a9d8",
            }}
        >
            그룹 평균 달성률: {chartItem.originalGroupRate}%
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
        <section
        style={{
            width: "100%",
            padding: "20px",
            boxSizing: "border-box",
            backgroundColor: "#fcfbf9",
            borderRadius: "20px",
        }}
        >
        <h3
            style={{
            margin: "0 0 12px",
            color: "#333",
            fontSize: "1.2rem",
            }}
        >
            TODO 달성률
        </h3>

        {chartData.length > 0 ? (
            <div
            style={{
                width: "100%",
                height: "250px",
            }}
            >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={chartData}
                stackOffset="sign"
                margin={{
                    top: 10,
                    right: 20,
                    left: -10,
                    bottom: 0,
                }}
                >
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#ddd"
                />

                <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                    fill: "#555",
                    fontSize: 12,
                    fontWeight: "bold",
                    }}
                    dy={10}
                />

                <YAxis
                    domain={[-100, 100]}
                    ticks={[-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                    fill: "#888",
                    fontSize: 11,
                    }}
                    tickFormatter={(value) => `${Math.abs(value)}%`}
                />

                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                    fill: "#f5f1fa",
                    }}
                />

                <Legend
                    verticalAlign="top"
                    align="left"
                    formatter={formatLegend}
                    wrapperStyle={{
                    paddingBottom: "10px",
                    fontSize: "12px",
                    }}
                />

                {/* 개인과 그룹의 기준선 */}
                <ReferenceLine y={0} stroke="#bbb" />

                {/* 위쪽 막대 */}
                <Bar
                    dataKey="personalRate"
                    stackId="todo"
                    fill="#654ca3"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                />

                {/* 아래쪽 막대 */}
                <Bar
                    dataKey="groupRate"
                    stackId="todo"
                    fill="#e6c2e4"
                    radius={[0, 0, 4, 4]}
                    maxBarSize={28}
                />
                </BarChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <p
            style={{
                marginTop: "40px",
                color: "#aaa",
                textAlign: "center",
            }}
            >
            Todo 기록이 없습니다.
            </p>
        )}
        </section>
    );
}
