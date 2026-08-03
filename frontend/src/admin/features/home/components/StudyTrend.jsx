import { useState } from "react"
import { getStudyTrend } from "../api/study"
import { useEffect } from "react"
import { formatDate, getMonday } from "../../../../../util/date"
import DatePicker from "react-datepicker"
import { ko } from "date-fns/locale"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import "react-datepicker/dist/react-datepicker.css"

const getDaysDifference = (start, end) => {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const today = new Date()
const monday = getMonday(today)


export default function StudyTrend() {
    const [type, setType] = useState("daily")
    const [dateRange, setDateRange] = useState([monday, today])
    const [startDate, endDate] = dateRange

    const [chartData, setChartData] = useState([])
    const [summary, setSummary] = useState(null)

    const handleDateChange = (update) => {
        const [newStart, newEnd] = update

        if (newStart && newEnd) {
            const diffDays = getDaysDifference(newStart, newEnd)

            if (type === "daily" && diffDays > 14) {
                alert("일간 조회는 최대 14일까지만 선택할 수 있습니다.")
                setDateRange([newStart, null])
                return
            }

            if (type === "weekly" && diffDays > 90) {
                alert("주간 조회는 최대 3개월까지만 선택할 수 있습니다.")
                setDateRange([newStart, null])
                return
            }
        }

        setDateRange(update)
    }

    const handleTypeChange = (targetType) => {
        if (startDate && endDate) {
            const diffDays = getDaysDifference(startDate, endDate)

            if (targetType === "daily" && diffDays > 14) {
                alert("선택된 기간이 14일을 초과하여 일간 조회로 전환할 수 없습니다. 달력에서 기간을 먼저 줄여주세요.")
                return
            }

            if (targetType === "weekly" && diffDays > 90) {
                alert("선택된 기간이 3개월을 초과하여 주간 조회로 전환할 수 없습니다. 달력에서 기간을 먼저 줄여주세요.")
                return
            }
        }

        setType(targetType)
    }

    useEffect(() => {
        const fetchTrendData = async () => {
            if (!startDate || !endDate) return

            try {
                const start = formatDate(startDate)
                const end = formatDate(endDate)

                const { trend, currentPeriod, previousPeriod, comparison } = await getStudyTrend(type, start, end)

                let formattedTrend = []

                // 1. 일간(daily)일 때: 빈 날짜를 0으로 채워주는 기존 로직 사용
                if (type === "daily") {
                    const allDates = [];
                    let currentDate = new Date(startDate)
                    const lastDate = new Date(endDate)

                    while (currentDate <= lastDate) {
                        allDates.push(formatDate(currentDate))
                        currentDate.setDate(currentDate.getDate() + 1)
                    }

                    formattedTrend = allDates.map(dateStr => {
                        const foundData = trend.find(item => item.date === dateStr)
                        const [yyyy, mm, dd] = dateStr.split("-")

                        return {
                            date: dateStr,
                            displayDate: `${mm}.${dd}`, // 예: 07.27
                            hours: foundData ? Math.round(foundData.totalMinutes / 60) : 0,
                            totalMinutes: foundData ? foundData.totalMinutes : 0
                        }
                    })
                }
                // 2. 주간(weekly), 월간(monthly)일 때: 백엔드 데이터를 그대로 가공
                else {
                    formattedTrend = trend.map(item => {
                        let display = item.date // 기본값

                        if (type === "monthly") {
                            const [yyyy, mm] = item.date.split("-")
                            display = `${parseInt(mm, 10)}월`;
                        }
                        else if (type === "weekly") {
                            display = item.date
                        }

                        return {
                            date: item.date,
                            displayDate: display,
                            hours: Math.round(item.totalMinutes / 60),
                            totalMinutes: item.totalMinutes
                        }
                    })
                }

                // 완성된 데이터를 차트에 넣기
                setChartData(formattedTrend)

                const displayRate = comparison.changeRate === null
                    ? "신규"
                    : `${comparison.changeRate}%`

                setSummary({
                    currentPeriod,
                    previousPeriod,
                    comparison: { ...comparison, displayRate }
                })

            } catch (error) {
                console.error("추이 데이터 로딩 에러:", error)
                alert(error.message)
                setChartData([])
                setSummary(null)
            }
        }

        fetchTrendData()
    }, [type, startDate, endDate])

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: "#fff", padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
                    <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
                    <p style={{ margin: 0, color: "#6A5ACD" }}>
                        총 공부시간 {payload[0].value.toLocaleString()}시간
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div style={{ padding: "20px", maxWidth: "800px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                    <button onClick={() => handleTypeChange("daily")} style={{ fontWeight: type === "daily" ? "bold" : "normal" }}>일간</button>
                    <button onClick={() => handleTypeChange("weekly")} style={{ fontWeight: type === "weekly" ? "bold" : "normal" }}>주간</button>
                    <button onClick={() => handleTypeChange("monthly")} style={{ fontWeight: type === "monthly" ? "bold" : "normal" }}>월간</button>
                </div>
                <div style={{ zIndex: 10 }}> {/* 달력이 차트 뒤로 숨지 않도록 zIndex 설정 */}
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={handleDateChange}
                        locale={ko}
                        dateFormat="yyyy.MM.dd" // 인풋 창에 보여질 포맷
                        maxDate={new Date()} // 미래 날짜 선택 방지 (선택 사항)
                        customInput={
                            <button style={{
                                padding: "8px 12px",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                backgroundColor: "#fff",
                                cursor: "pointer"
                            }}>
                                🗓 {startDate ? formatDate(startDate) : ""} ~ {endDate ? formatDate(endDate) : ""}
                            </button>
                        }
                    />
                </div>
            </div>

            {/* 차트 영역 */}
            <div style={{ height: "300px", width: "100%", backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#888', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#888', fontSize: 12 }}
                            tickFormatter={(value) => `${value.toLocaleString()}`} // 숫자에 콤마 추가
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="linear"
                            dataKey="hours"
                            stroke="#6A5ACD"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                            activeDot={{ r: 6, strokeWidth: 2, stroke: "#6A5ACD" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 하단 요약 카드 영역 */}
            {summary && (
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px", padding: "20px", border: "1px solid #eee", borderRadius: "12px" }}>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#666", fontSize: "14px" }}>선택 기간 총 공부시간</p>
                        <h2 style={{ color: "#4A00E0", margin: "5px 0" }}>
                            {Math.round(summary.currentPeriod.totalMinutes / 60).toLocaleString()}시간
                        </h2>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#666", fontSize: "14px" }}>이전 기간 총 공부시간</p>
                        <h2 style={{ margin: "5px 0" }}>
                            {Math.round(summary.previousPeriod.totalMinutes / 60).toLocaleString()}시간
                        </h2>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#666", fontSize: "14px" }}>비교</p>
                        <p style={{ color: summary.comparison.differenceMinutes > 0 ? "#4A00E0" : "#ff4d4f", fontWeight: "bold", margin: "5px 0" }}>
                            {summary.comparison.differenceMinutes > 0 ? "+" : ""}
                            {Math.round(summary.comparison.differenceMinutes / 60).toLocaleString()}시간
                        </p>
                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>
                            {summary.comparison.displayRate}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}