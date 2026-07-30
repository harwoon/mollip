import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getWeeklyTodoRecords } from "../api/weekly.js"
import { getWeeklyTodoCompare  } from "../api/weekly.js"

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"]

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const { name, totalCount, completedCount, achievementRate } = payload[0].payload

  return (
    <div
      style={{
        padding: "12px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <p style={{ margin: "0 0 5px", color: "#9b82c9", fontWeight: "bold" }}>
        {name}요일
      </p>

      <p style={{ margin: "0 0 4px", color: "#333" }}>
        목표 달성률 {achievementRate}%
      </p>

      <p style={{ margin: 0, color: "#888", fontSize: "12px" }}>
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
  }))

  records.forEach((record) => {
    const dayNumber = dayjs(record.todoDate).day()
    const dayIndex = dayNumber === 0 ? 6 : dayNumber - 1
    const todos = Array.isArray(record.todo) ? record.todo : []
    const completedCount = todos.filter((todo) => todo.state === true).length

    weeklyResult[dayIndex].totalCount += todos.length
    weeklyResult[dayIndex].completedCount += completedCount
  })

  return weeklyResult.map((item) => ({
    ...item,
    achievementRate:
      item.totalCount > 0
        ? Number(((item.completedCount / item.totalCount) * 100).toFixed(1))
        : 0,
  }))
}

export default function GoalAchievementChart({ selectedDate }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD")
        const data = await getWeeklyTodoRecords(formattedDate)
        const records = Array.isArray(data) ? data : data?.records || []

        setChartData(makeWeeklyChartData(records))
      } catch (error) {
        console.error("주간 목표 달성률을 가져오는데 실패했습니다:", error)
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
        목표 달성률
      </h3>

      {chartData.length > 0 ? (
        <div style={{ width: "100%", height: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              barSize={22}
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
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#555", fontSize: 11 }}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f4f0fa" }} />

              <Bar
                dataKey="achievementRate"
                fill="#9b82c9"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={{ margin: "40px 0", textAlign: "center", color: "#aaa" }}>
          목표 기록이 없습니다.
        </p>
      )}
    </section>
  )
}