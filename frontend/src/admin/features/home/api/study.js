import { API_URL } from "../../../../config/apiUrl.js"

// 최근 공부 시간 추이
// http://127.0.0.1:3000/admin/study-time-trend?type=daily&startDate=2026-07-01&endDate=2026-07-14
export async function getStudyTrend(type, start, end) {

    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/admin/study-time-trend?type=${type}&startDate=${start}&endDate=${end}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "학습 시간 추이 데이터를 불러오지 못했습니다.")
    }

    const { trend, currentPeriod, previousPeriod, comparison } = data

    return { trend, currentPeriod, previousPeriod, comparison }
}

// 전체 유저 이번 주 공부시간
// http://localhost:3000/admin/weekly-total-study-time
export async function getTotalTime() {

    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/admin/weekly-total-study-time`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "이번주 총 공부시간 데이터를 불러오지 못했습니다.")
    }

    return {
        currentWeeklyStudyTime:
            Number(
                data.currentWeeklyStudyTime,
            ) || 0,

        previousWeeklyStudyTime:
            Number(
                data.previousWeeklyStudyTime,
            ) || 0,

        weeklyStudyTimeDiff:
            Number(
                data.weeklyStudyTimeDiff,
            ) || 0,
    }
}