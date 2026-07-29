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
        personalTime: Number(item.personalTime) || 0,
        groupTime: Number(item.groupTime) || 0,
      },
    ]),
  )

  return DAY_NAMES.map((day) => {
    const studyTime = studyTimeMap.get(day)

    return {
      day,
      personalTime: studyTime?.personalTime || 0,
      groupTime: studyTime?.groupTime || 0,
    }
  })
}

function formatStudyTime(value) {
  const totalMinutes = Math.round((Number(value) || 0) * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}분`
  if (minutes === 0) return `${hours}시간`

  return `${hours}시간 ${minutes}분`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div>
      <strong>{label}요일</strong>

      {payload.map((item) => (
        <div key={item.dataKey}>
          <span>{item.name}: </span>
          <b>{formatStudyTime(item.value)}</b>
        </div>
      ))}
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

  if (loading) return <p>주간 통계를 불러오는 중...</p>
  if (error) return <p>{error}</p>

  return (
    <section>
      <h3>주간 총 공부량</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
          <CartesianGrid vertical={false} strokeDasharray="2 6" />

          <XAxis
            dataKey="day"
            interval={0}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            domain={[0, "auto"]}
            tickFormatter={(value) => `${value}H`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend />

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