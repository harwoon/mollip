import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getWeeklyStudyRecords } from "../api/weekly"

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"]

function makeWeeklyChartData(records, selectedDate) {
  const studyTimeByDate = records.reduce((result, record) => {
    const studyDate = record.studyDate
    const studyTime = Number(record.sumStudyTime) || 0

    result[studyDate] = (result[studyDate] || 0) + studyTime

    return result
  }, {})

  const selectedDay = dayjs(selectedDate)
  const dayNumber = selectedDay.day()
  const monday = selectedDay.subtract(dayNumber === 0 ? 6 : dayNumber - 1, "day")

  return WEEK_DAYS.map((day, index) => {
    const date = monday.add(index, "day").format("YYYY-MM-DD")
    
    const rawSeconds = studyTimeByDate[date] || 0

    return {
      name: day,
      date,
      rawSeconds,
      hours: Number((rawSeconds / 3600).toFixed(1)),
    }
  })
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const { name, date, rawSeconds } = payload[0].payload
  
  const totalMinutes = Math.floor(rawSeconds / 60)
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return (
    <div
      style={{
        padding: "12px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <p style={{ margin: "0 0 5px", color: "#8a6bc7", fontWeight: "bold" }}>
        {name}요일
      </p>

      <p style={{ margin: "0 0 5px", color: "#888", fontSize: "12px" }}>
        {dayjs(date).format("YYYY.MM.DD")}
      </p>

      <p style={{ margin: 0, color: "#333" }}>
        {hours}시간 {minutes}분
      </p>
    </div>
  )
}

export default function WeeklyStudyTimeChart({ selectedDate }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD")
        const data = await getWeeklyStudyRecords(formattedDate)
        const records = Array.isArray(data) ? data : data?.records || []

        setChartData(makeWeeklyChartData(records, formattedDate))
      } catch (error) {
        console.error("주간 공부 시간을 가져오는데 실패했습니다:", error)
        setChartData([])
      }
    }

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
      <h3 style={{ margin: "0 0 20px", color: "#333", fontSize: "1.2rem" }}>
        주간 총 공부 시간
      </h3>

      {chartData.length > 0 ? (
        <div style={{ width: "100%", height: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#555", fontSize: 12, fontWeight: "bold" }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888", fontSize: 12 }}
                tickFormatter={(value) => `${value}H`}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#d9d1ec", strokeDasharray: "3 3" }}
              />

              <Line
                type="linear"
                dataKey="hours"
                stroke="#8a6bc7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#8a6bc7" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={{ marginTop: "40px", color: "#aaa", textAlign: "center" }}>
          공부 기록이 없습니다.
        </p>
      )}
    </section>
  )
}