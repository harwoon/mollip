import { FiCheckCircle } from "react-icons/fi"
import SummaryCard from "../features/home/components/SummaryCard.jsx"

import { useEffect, useMemo, useState } from "react"
import { getAllAdminUsers } from "../api/adminUserApi"

const DORMANT_GROUP_ID = import.meta.env.VITE_DORMANT_GROUP_ID

export default function WeeklyAverageAchievementCard() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError("")

        const userList = await getAllAdminUsers()

        setUsers(userList)
      } catch (error) {
        console.error("[관리자] 평균 목표 달성률 조회 실패:", error)

        setError("목표 달성률을 불러오지 못했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const averageAchievementRate = useMemo(() => {
    const activeUsers = users.filter((user) => {
      const userGroupId =
        user.group?._id ??
        user.groupId ??
        ""

      return (
        user.role === "user" &&
        user.useYn === "Y" &&
        String(userGroupId) !== DORMANT_GROUP_ID
      )
    })

    if (activeUsers.length === 0) {
      return 0
    }

    const totalAchievementRate = activeUsers.reduce(
      (sum, user) => {
        return sum + (Number(user.achievementRate) || 0)
      },
      0
    )

    return Math.round(
      totalAchievementRate / activeUsers.length
    )
  }, [users])

  if (isLoading) {
    return (
      <SummaryCard
        icon={<FiCheckCircle />}
        label="이번 주 평균 목표 달성률"
        value="..."
        unit=""
      />
    )
  }

  if (error) {
    return (
      <SummaryCard
        icon={<FiCheckCircle />}
        label="이번 주 평균 목표 달성률"
        value="-"
        unit=""
      />
    )
  }

  return (
    <SummaryCard
      icon={<FiCheckCircle />}
      label="이번 주 평균 목표 달성률"
      value={averageAchievementRate}
      unit="%"
    />
  )
}