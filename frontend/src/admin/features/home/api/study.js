const API_URL = import.meta.env.VITE_LOCAL_API_URL

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

    const {trend, currentPeriod, previousPeriod, comparison} = data

    return  {trend, currentPeriod, previousPeriod, comparison}
}