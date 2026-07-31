import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { getGroupWeeklyStudyTime } from "../api/weekly";

import styles from "./GroupWeeklyStudyChart.module.css";
import { getChartTheme } from "../../../../util/chartTheme.js"

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

function makeChartData(data) {
    const studyTimeMap = new Map(
        data.map((item) => [
        item.day,
        {
            personalRawMinutes: Number(item.personalTime) || 0,
            groupRawMinutes: Number(item.groupTime) || 0,
        },
        ]),
    );

    return DAY_NAMES.map((day) => {
        const studyTime = studyTimeMap.get(day);

        const personalRawMinutes = studyTime?.personalRawMinutes || 0;
        const groupRawMinutes = studyTime?.groupRawMinutes || 0;

        return {
        day,
        personalRawMinutes,
        groupRawMinutes,
        personalTime: Number((personalRawMinutes / 60).toFixed(2)),
        groupTime: Number((groupRawMinutes / 60).toFixed(2)),
        };
    });
    }

    function formatStudyTime(rawMinutes) {
    const totalMinutes = Math.floor(rawMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0 && minutes === 0) return "0분";
    if (hours === 0) return `${minutes}분`;
    if (minutes === 0) return `${hours}시간`;

    return `${hours}시간 ${minutes}분`;
    }

    function CustomTooltip({ active, payload, label }) {
        if (!active || !payload?.length) return null;

        return (
            <div className={styles.tooltip}>
            <strong className={styles.tooltipTitle}>{label}요일</strong>

            {payload.map((item) => {
                const rawMinutes =
                item.dataKey === "personalTime"
                    ? item.payload.personalRawMinutes
                    : item.payload.groupRawMinutes;

                return (
                <div key={item.dataKey} className={styles.tooltipItem}>
                    <span className={styles.tooltipDot} style={{color: item.stroke,}}>●</span>
                    <span>{item.name}: </span>
                    <b>{formatStudyTime(rawMinutes)}</b>
                </div>
                )
            })}
            </div>
        )
    }

    export default function GroupWeeklyStudyChart({ selectedDate }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // 차트 변수
    const chartTheme = getChartTheme()

    useEffect(() => {
        const fetchGroupWeeklyData = async () => {
        try {
            setLoading(true);
            setError("");

            const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
            const data = await getGroupWeeklyStudyTime(formattedDate);
            const studies = Array.isArray(data) ? data : [];

            setChartData(makeChartData(studies));
        } catch (error) {
            console.error("그룹 주간 공부 통계 조회 실패:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
        };

        fetchGroupWeeklyData();
    }, [selectedDate]);

    if (loading)
        return (
            <p className={`commonSection ${styles.stateMessage}`}>주간 통계를 불러오는 중...</p>
        );
    if (error)
        return (
            <p className={`commonSection ${styles.errorMessage}`}>{error}</p>
        );

    return (
        <section className={`commonSection ${styles.container}`}>
            <h3 className={styles.title}>주간 총 공부량</h3>
            <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 10,
                            left: -10
                        }}
                    >
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="2 6"
                            stroke={chartTheme.colors.grid}
                        />

                        <XAxis
                            dataKey="day"
                            interval={0}
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
                            axisLine={false}
                            tickLine={false}
                            domain={[0, "auto"]}
                            tick={{
                                fill: chartTheme.colors.axis,
                                fontSize: chartTheme.fontSizes.md
                            }}
                            tickFormatter={(value) => `${value}H`}
                        />

                        <Tooltip
                            content={
                                <CustomTooltip />
                            }
                            cursor={{
                                stroke: chartTheme.colors.primarySoft,
                                strokeDasharray: "3 3"
                            }}
                        />

                        <Legend
                            wrapperStyle={{
                                fontSize: chartTheme.fontSizes.md,
                                color: chartTheme.colors.axisStrong,
                                paddingTop: "10px"
                            }}
                        />

                        <Line
                            type="monotone"
                            dataKey="groupTime"
                            name="그룹 평균 공부 시간"
                            stroke={chartTheme.colors.secondarySoft}
                            strokeWidth={chartTheme.sizes.lineWidth}
                            strokeDasharray="6 6"
                            dot={false}
                            activeDot={{
                                r: chartTheme.sizes.dotRadius,
                                fill: chartTheme.colors.secondarySoft
                            }}
                        />

                        <Line
                            type="monotone"
                            dataKey="personalTime"
                            name="개인 총 공부 시간"
                            stroke={chartTheme.colors.primary}
                            strokeWidth={chartTheme.sizes.lineWidth}
                            dot={false}
                            activeDot={{
                                r: chartTheme.sizes.dotRadius,
                                fill: chartTheme.colors.primary
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}