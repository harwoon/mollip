import { API_URL } from "../../../../config/apiUrl.js"

/**
 * 관리자 그룹별 주간 통계 조회
 *
 * GET /admin/groups/statistics
 */
export async function fetchAdminGroupStatistics() {
    const token = localStorage.getItem("token")

    if (!token) {
        throw new Error(
            "로그인 토큰이 없습니다."
        )
    }

    const response = await fetch(
        `${API_URL}/admin/groups/statistics`,
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
            "그룹 통계를 불러오지 못했습니다."
        )
    }

    return data
}