import { useState } from "react";
import { getStudyTrend } from "../api/study";
import { useEffect } from "react";
import { formatDate, getMonday } from "../../../../../util/date";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import { FiCalendar } from "react-icons/fi";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";


import AppAlert from "../../../../components/common/AppAlert.jsx"
import "react-datepicker/dist/react-datepicker.css";
import styles from "./StudyTrend.module.css";

const getDaysDifference = (start, end) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 전달받은 날짜가 속한 주의 일요일 구하기
const getSunday = (date) => {
    const monday = getMonday(new Date(date));
    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return sunday;
};

export default function StudyTrend() {
    const [type, setType] = useState("daily");
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const monday = getMonday(today);
        const sunday = getSunday(today);

        return [monday, sunday];
    });
    const [startDate, endDate] = dateRange;

    const [chartData, setChartData] = useState([]);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const handleDateChange = (update) => {
        const [newStart, newEnd] = update

        if (newStart && newEnd) {
            const diffDays = getDaysDifference(newStart, newEnd)

            if (type === "daily" && diffDays > 14) {
                setAlertMessage("일간 조회는 최대 14일까지만 선택할 수 있습니다.")
                setDateRange([newStart, null])
                return
            }

            if (type === "weekly" && diffDays > 90) {
                setAlertMessage("주간 조회는 최대 3개월까지만 선택할 수 있습니다.")
                setDateRange([newStart, null])
                return
            }
        }

        setDateRange(update);
    }

    const handleTypeChange = (targetType) => {
        if (startDate && endDate) {
            const diffDays = getDaysDifference(startDate, endDate);

            if (targetType === "daily" && diffDays > 14) {
                setAlertMessage("선택된 기간이 14일을 초과합니다. 달력에서 기간을 먼저 줄여주세요.")
                return
            }

            if (targetType === "weekly" && diffDays > 90) {
                setAlertMessage("선택된 기간이 3개월을 초과합니다. 달력에서 기간을 먼저 줄여주세요.")
                return
            }
        }

        setType(targetType)
    }

    useEffect(() => {
        const fetchTrendData = async () => {
            if (!startDate || !endDate) return;

            try {
                const start = formatDate(startDate);
                const end = formatDate(endDate);

                const { trend, currentPeriod, previousPeriod, comparison } =
                    await getStudyTrend(type, start, end);

                let formattedTrend = [];

                // 1. 일간(daily)일 때: 빈 날짜를 0으로 채워주는 기존 로직 사용
                if (type === "daily") {
                    const allDates = [];
                    let currentDate = new Date(startDate);
                    const lastDate = new Date(endDate);

                    while (currentDate <= lastDate) {
                        allDates.push(formatDate(currentDate));
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                    formattedTrend = allDates.map((dateStr) => {
                        const foundData = trend.find((item) => item.date === dateStr);
                        const [yyyy, mm, dd] = dateStr.split("-");

                        return {
                            date: dateStr,
                            displayDate: `${mm}.${dd}`, // 예: 07.27
                            hours: foundData ? Math.round(foundData.totalMinutes / 3600) : 0,
                            totalMinutes: foundData ? foundData.totalMinutes : 0,
                        };
                    });
                }
                // 2. 주간(weekly), 월간(monthly)일 때: 백엔드 데이터를 그대로 가공
                else {
                    formattedTrend = trend.map((item) => {
                        let display = item.date; // 기본값

                        if (type === "monthly") {
                            const [yyyy, mm] = item.date.split("-");
                            display = `${parseInt(mm, 10)}월`;
                        } else if (type === "weekly") {
                            display = item.date;
                        }

                        return {
                            date: item.date,
                            displayDate: display,
                            hours: Math.round(item.totalMinutes / 3600),
                            totalMinutes: item.totalMinutes,
                        };
                    });
                }

                // 완성된 데이터를 차트에 넣기
                setChartData(formattedTrend);

                const displayRate =
                    comparison.changeRate === null ? "신규" : `${comparison.changeRate}%`;

                setSummary({
                    currentPeriod,
                    previousPeriod,
                    comparison: { ...comparison, displayRate },
                })

            } catch (error) {
                console.error("추이 데이터 로딩 에러:", error)
                setAlertMessage(error.message || "공부시간 추이를 불러오지 못했습니다.")
                setChartData([])
                setSummary(null)

            }finally {
                setLoading(false)
            }
        }

        fetchTrendData()
    }, [type, startDate, endDate])

    
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.adminTrendTooltip}>
                    <strong>{label}</strong>
                    <p>총 공부시간 {payload[0].value.toLocaleString()}시간</p>
                </div>
            )
        }
        return null
    }

    return (
        <section className={`commonSection ${styles.adminTrendCard}`}>
            <div className={styles.adminTrendHeader}>
                <div>
                    <h2>전체 공부시간 추이</h2>
                    <p>기간별 서비스 전체 공부시간 변화를 확인합니다.</p>
                </div>

                <div className={styles.adminTrendControls}>
                    <div className={styles.adminTrendTabs} role="tablist">
                        {[
                            ["daily", "일간"],
                            ["weekly", "주간"],
                            ["monthly", "월간"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                className={type === value ? styles.active : ""}
                                onClick={() => handleTypeChange(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={handleDateChange}
                        locale={ko}
                        dateFormat="yyyy.MM.dd"
                        maxDate={getSunday(new Date())}
                        customInput={
                            <button type="button" className={`app-btn-secondary ${styles.adminTrendDateButton}`}>
                                <FiCalendar className={styles.adminTrendDateIcon} aria-hidden="true" />
                                {startDate ? formatDate(startDate) : ""}
                                {" ~ "}
                                {endDate ? formatDate(endDate) : ""}
                            </button>
                        }
                    />
                </div>
            </div>

            {loading ? (
                <div className={`app-modal-state ${styles.adminTrendLoading}`}>
                    <div className="app-spinner" aria-hidden="true" />
                    <p>추이 데이터를 불러오는 중입니다.</p>
                </div>
            ) : (
                <div className={styles.adminTrendChart}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="linear"
                                dataKey="hours"
                                stroke="var(--chart-primary)"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--chart-primary)" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {summary && (
                <div className={styles.adminTrendSummary}>
                    <div>
                        <span>선택 기간 총 공부시간</span>
                        <strong>{Math.round(summary.currentPeriod.totalMinutes / 3600).toLocaleString()}시간</strong>
                    </div>
                    <div>
                        <span>이전 기간 총 공부시간</span>
                        <strong>{Math.round(summary.previousPeriod.totalMinutes / 3600).toLocaleString()}시간</strong>
                    </div>
                    <div>
                        <span>이전 기간 대비</span>
                        <strong className={summary.comparison.differenceMinutes >= 0 ? styles.positive : styles.negative}>
                            {summary.comparison.differenceMinutes > 0 ? "+" : ""}
                            {Math.round(summary.comparison.differenceMinutes / 3600).toLocaleString()}시간
                        </strong>
                        <small>{summary.comparison.displayRate}</small>
                    </div>
                </div>
            )}

            <AppAlert
                open={Boolean(alertMessage)}
                type="warning"
                title="조회 조건을 확인해주세요."
                message={alertMessage}
                onConfirm={() => setAlertMessage("")}
                onClose={() => setAlertMessage("")}
            />
        </section>
    )
}
