const API_URL = import.meta.env.VITE_LOCAL_API_URL

// 주간 AI 코칭 리포트 조회
export async function getWeeklyReport() {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/ai/weekly-report`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "AI 리포트를 불러오지 못했습니다.")
    }

    return data   // { message, report }
}
