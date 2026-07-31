import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getGroupWeeklyStudyTime } from "../api/weekly"

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"]

function makeChartData(data) {
  const studyTimeMap = new Map(
    data.map((item) => [
      item.day,
      {
        personalRawMinutes: Number(item.personalTime) || 0,
        groupRawMinutes: Number(item.groupTime) || 0,
      },
    ]),
  )

  return DAY_NAMES.map((day) => {
    const studyTime = studyTimeMap.get(day)

    const personalRawMinutes = studyTime?.personalRawMinutes || 0
    const groupRawMinutes = studyTime?.groupRawMinutes || 0

    return {
      day,
      personalRawMinutes,
      groupRawMinutes,
      personalTime: Number((personalRawMinutes / 60).toFixed(2)),
      groupTime: Number((groupRawMinutes / 60).toFixed(2)),
    }
  })
}

function formatStudyTime(rawMinutes) {
  const totalMinutes = Math.floor(rawMinutes)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0 && minutes === 0) return "0분"
  if (hours === 0) return `${minutes}분`
  if (minutes === 0) return `${hours}시간`

  return `${hours}시간 ${minutes}분`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        padding: "12px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "none"
      }}
    >
      <strong style={{ display: "block", marginBottom: "8px", color: "#333" }}>{label}요일</strong>

      {payload.map((item) => {
        const rawMinutes = item.dataKey === "personalTime" 
          ? item.payload.personalRawMinutes 
          : item.payload.groupRawMinutes

        return (
          <div key={item.dataKey} style={{ marginBottom: "4px", fontSize: "13px", color: "#555" }}>
            <span style={{ color: item.stroke, fontWeight: "bold" }}>● </span>
            <span>{item.name}: </span>
            <b style={{ color: "#333" }}>{formatStudyTime(rawMinutes)}</b>
          </div>
        )
      })}
    </div>
  )
}

export default function GroupWeeklyStudyChart({ selectedDate }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchGroupWeeklyData = async () => {
      try {
        setLoading(true)
        setError("")

        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD")
        const data = await getGroupWeeklyStudyTime(formattedDate)
        const studies = Array.isArray(data) ? data : []

        setChartData(makeChartData(studies))
      } catch (error) {
        console.error("그룹 주간 공부 통계 조회 실패:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGroupWeeklyData()
  }, [selectedDate])

  if (loading) return <p style={{ textAlign: "center", color: "#aaa", padding: "40px 0" }}>주간 통계를 불러오는 중...</p>
  if (error) return <p style={{ textAlign: "center", color: "#e74c3c", padding: "40px 0" }}>{error}</p>

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
      <h3 style={{ margin: "0 0 20px", color: "#333", fontSize: "1.2rem" }}>주간 총 공부량</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
          <CartesianGrid vertical={false} strokeDasharray="2 6" stroke="#ddd" />

          <XAxis
            dataKey="day"
            interval={0}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#555", fontSize: 12, fontWeight: "bold" }}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            domain={[0, "auto"]}
            tick={{ fill: "#888", fontSize: 12 }}
            tickFormatter={(value) => `${value}H`}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#d9d1ec", strokeDasharray: "3 3" }} />

          <Legend wrapperStyle={{ fontSize: "12px", color: "#555", paddingTop: "10px" }} />

          <Line
            type="monotone"
            dataKey="groupTime"
            name="그룹 평균 공부 시간"
            stroke="#efc7e9"
            strokeWidth={2}
            strokeDasharray="6 6"
            dot={false}
            activeDot={{ r: 5 }}
          />

          <Line
            type="monotone"
            dataKey="personalTime"
            name="개인 총 공부 시간"
            stroke="#9b83d0"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}