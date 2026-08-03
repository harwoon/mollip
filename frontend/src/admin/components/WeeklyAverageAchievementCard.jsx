// src/features/admin/components/WeeklyAverageAchievementCard.jsx

import { useEffect, useMemo, useState } from "react"
import { getAllAdminUsers } from "../api/adminUserApi"
import "./WeeklyAverageAchievementCard.css"

const DORMANT_GROUP_ID = "6a6c35fa39f4827ac141db88"

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
        console.error(
          "[관리자] 평균 목표 달성률 조회 실패:",
          error
        )

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

  return (
    <section className="weekly-achievement-card">
      <div className="weekly-achievement-card__header">
        <span className="weekly-achievement-card__icon">
          ✓
        </span>

        <h3>이번 주 평균 목표 달성률</h3>
      </div>

      <div className="weekly-achievement-card__content">
        {isLoading && (
          <p className="weekly-achievement-card__status">
            불러오는 중...
          </p>
        )}

        {!isLoading && error && (
          <p className="weekly-achievement-card__error">
            {error}
          </p>
        )}

        {!isLoading && !error && (
          <strong className="weekly-achievement-card__rate">
            {averageAchievementRate}
            <span>%</span>
          </strong>
        )}
      </div>
    </section>
  )
}