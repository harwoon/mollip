import React, { useEffect, useState } from "react";
import { getWeeklySubjectRatio } from "../api/weekly.js";
import dayjs from "dayjs";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import styles from "./SubjectStudyTimeChart.module.css";

export default function SubjectStudyTimeChart({ selectedDate }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");

            const data = await getWeeklySubjectRatio(formattedDate);

            const subjects = Array.isArray(data.subjects) ? data.subjects : [];

            const formattedChartData = subjects.map((subject) => ({
            name: subject.studyTitle,

            // 파이 차트의 크기를 결정하는 값
            value: Number(subject.sumStudyTime) || 0,

            // 서버에서 계산한 비율
            ratio: Number(subject.ratio) || 0,

            rawSeconds: Number(subject.sumStudyTime) || 0,

            color: subject.subjectColor || "#D9D9D9",
            }));

            setChartData(formattedChartData);
        } catch (error) {
            console.error(
            "주간 과목별 공부 시간을 가져오는데 실패했습니다:",
            error,
            );

            setChartData([]);
        }
        };

        fetchData();
    }, [selectedDate]);

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) {
        return null;
        }

        const { name, rawSeconds, ratio, color } = payload[0].payload;

        const totalMinutes = Math.floor(rawSeconds / 60);

        const hours = Math.floor(totalMinutes / 60);

        const minutes = totalMinutes % 60;

        return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipTitle} style={{ color }}>
            {name}
            </p>

            <p className={styles.tooltipTime}>
            {hours}시간 {minutes}분
            </p>

            <p className={styles.tooltipRatio}>전체 공부 시간의 {ratio}%</p>
        </div>
        );
    };

    return (
        <section className={`commonSection ${styles.container}`}>
        <h3 className={styles.title}>주간 과목별 공부 시간</h3>

        {chartData.length > 0 ? (
            <div className={styles.content}>
            <div className={styles.legend}>
                {chartData.map((subject) => (
                <div key={subject.name} className={styles.legendItem}>
                    <span
                    className={styles.legendColor}
                    style={{
                        backgroundColor: subject.color,
                    }}
                    />

                    <span className={styles.legendName}>{subject.name}</span>
                </div>
                ))}
            </div>

            <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius="75%"
                    paddingAngle={0}
                    stroke="none"
                    >
                    {chartData.map((subject, index) => (
                        <Cell key={`cell-${index}`} fill={subject.color} />
                    ))}
                    </Pie>

                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
                </ResponsiveContainer>
            </div>
            </div>
        ) : (
            <p className={styles.emptyMessage}>공부 기록이 없습니다.</p>
        )}
        </section>
    )
}
