import { API_URL } from "../../../config/apiUrl.js"

// 리포트 상태 조회 (생성하지 않고 리포트 목록 + 생성 가능 여부만 확인)
// date를 지정하면 해당 날짜("YYYY-MM-DD")에 생성된 리포트를 조회하고, 생략하면 오늘 리포트를 조회한다
export async function getAiReportStatus(date) {
    const token = localStorage.getItem("token")

    const query = date ? `?date=${date}` : ""

    const response = await fetch(`${API_URL}/ai/report${query}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "AI 리포트 상태를 불러오지 못했습니다.")
    }

    return data   // { message, reports, ready, date, isToday }
}

// "새 리포트 생성하기" 버튼 클릭 시 호출
// 직전 리포트 이후 3시간이 쌓였는지 서버에서 확인 후, 조건을 채웠으면 새 리포트를 생성한다
export async function generateAiReport() {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/ai/report`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "AI 리포트를 생성하지 못했습니다.")
    }

    return data   // { message, reports, ready }
}
