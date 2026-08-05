import { API_URL } from "../../../../config/apiUrl.js"

// 관리자 - 그룹 개수 조회
export async function getGroupCount() {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/admin/groups/count`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok) {
        throw new Error(data.message || "그룹 수를 불러오지 못했습니다.")
    }

    return data
}
export async function getGroupStudyTime() {
    const response = await fetch(`${API_URL}/admin/groups/weekly-study-time`, {
        method: "GET",
        headers: authHeaders()
    })

    const data = await response.json()
    if(!response.ok) {
        throw new Error(data.message || "그룹 목록을 불러오지 못했습니다.")
    }

    return data
}