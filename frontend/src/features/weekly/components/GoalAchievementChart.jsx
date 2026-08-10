import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { getWeeklyTodoRecords } from "../api/weekly.js";

import styles from "./GoalAchievementChart.module.css";
import { getChartTheme } from "../../../../util/chartTheme.js"

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;

    const { name, totalCount, completedCount, achievementRate } =
        payload[0].payload;

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipTitle}>{name}요일</p>
            <p className={styles.tooltipRate}>TODO 달성률 {achievementRate}%</p>
            <p className={styles.tooltipCount}>
                전체 {totalCount}개 중 {completedCount}개 완료
            </p>
        </div>
    )
}

function makeWeeklyChartData(records) {
    const weeklyResult = WEEK_DAYS.map((day) => ({
        name: day,
        totalCount: 0,
        completedCount: 0,
        achievementRate: 0,
    }));

    records.forEach((record) => {
        const dayNumber = dayjs(record.todoDate).day();
        const dayIndex = dayNumber === 0 ? 6 : dayNumber - 1;
        const todos = Array.isArray(record.todo) ? record.todo : [];
        const completedCount = todos.filter((todo) => todo.state === true).length;

        weeklyResult[dayIndex].totalCount += todos.length;
        weeklyResult[dayIndex].completedCount += completedCount;
    });

    return weeklyResult.map((item) => ({
        ...item,
        achievementRate:
        item.totalCount > 0
            ? Number(((item.completedCount / item.totalCount) * 100).toFixed(1))
            : 0,
    }));
    }

    export default function GoalAchievementChart({ selectedDate }) {
    const [chartData, setChartData] = useState([]);

    // 차트 변수
    const chartTheme = getChartTheme()

    useEffect(() => {
        const fetchData = async () => {
        try {
            const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
            const data = await getWeeklyTodoRecords(formattedDate);
            const records = Array.isArray(data) ? data : data?.records || [];

            setChartData(makeWeeklyChartData(records));
        } catch (error) {
            console.error("주간 목표 달성률을 가져오는데 실패했습니다:", error);
            setChartData([]);
        }
        };

        fetchData();
    }, [selectedDate]);

    return (
        <section className={`commonSection ${styles.container}`}>
            <h3 className={styles.title}>TODO 달성률</h3>

            {chartData.length > 0 ? (
                <div className={styles.chartArea}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 20,
                                left: -10,
                                bottom: 0
                            }}
                            // barSize={22}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke={chartTheme.colors.grid}
                            />

                            <XAxis
                                dataKey="name"
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
                                domain={[0, 100]}
                                ticks={[0, 20, 40, 60, 80, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: chartTheme.colors.axisStrong, 
                                    fontSize: chartTheme.fontSizes.sm
                                }}
                                tickFormatter={(value) => `${value}%`}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{fill: chartTheme.colors.cursor}}
                            />

                            <Bar
                                dataKey="achievementRate"
                                fill={chartTheme.colors.primarySoft}
                                barSize={chartTheme.sizes.barSize}
                                radius={[
                                    chartTheme.sizes.barRadius,
                                    chartTheme.sizes.barRadius,
                                    0,
                                    0
                                ]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className={styles.emptyMessage}>목표 기록이 없습니다.</p>
            )}
        </section>
    )
}