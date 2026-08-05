import { API_URL } from "../../../config/apiUrl.js"

/**
 * 로그인 사용자의 주간 그룹 목표 달성 현황 조회
 *
 * GET /group/goals/me
 */
export async function fetchMyWeeklyGroupGoals() {
    const token = localStorage.getItem("token")

    if (!token) {
        throw new Error("로그인 토큰이 없습니다.")
    }

    const response = await fetch(
        `${API_URL}/group/goals/me`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
            "그룹 목표 정보를 불러오지 못했습니다."
        )
    }

    return data
}