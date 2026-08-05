import { API_URL } from "../../../config/apiUrl.js"

// 기록 페이지의 일간·주간·월간 Todo 조회
export async function getTodoRecords(type, date) {
    const token = localStorage.getItem("token")

    const response = await fetch(
        `${API_URL}/todo/records?type=${type}&date=${date}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "Todo 기록을 불러오지 못했습니다."
        )
    }

    return data
}