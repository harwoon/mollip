import { API_URL } from "../../../../config/apiUrl.js"

// 백 완료 전까지 보류
// 유저 정보 조회
// export async function getUserInfo() {
//     const token = localStorage.getItem("token")

//     const response = await fetch(`${API_URL}/admin/user`, {
//         method: "GET",
//         headers: {
//             Authorization: `Bearer ${token}`
//         }
//     })

//     const data = await response.json()

//     if(!response.ok) {
//         throw new Error(data.message || "유저 정보를 가져오지 못했습니다.")
//     }

//     return data
// }

// 과목별 공부 시간 가져오기
export async function getSubjectRecord(type, start, end, userId) {
    const token = localStorage.getItem("token")

    let url = `${API_URL}/admin/user/subjectTrend?type=${type}&start=${start}&end=${end}&userid=${userId}`

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "총 과목 시간을 불러오지 못했습니다.")
    }

    return data
}

// 기록 페이지의 일간·주간·월간 Todo 조회
export async function getTodoRecords(type, date, userId) {
    const token = localStorage.getItem("token")

    let url = `${API_URL}/admin/achievement?type=${type}&date=${date}`
    if (userId) {
        url += `&userId=${userId}`
    }

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || "Todo 기록을 불러오지 못했습니다."
        )
    }

    return data
}