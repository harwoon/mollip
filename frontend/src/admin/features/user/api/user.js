import { API_URL } from "../../../../config/apiUrl.js"

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

// 총 공부 시간 추이 가져오기
export async function getStudyTrend(type, start, end, userId) {
    const token = localStorage.getItem("token")

    let url = `${API_URL}/admin/user/studyTrend?type=${type}&start=${start}&end=${end}&userid=${userId}`

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "총 공부 시간을 불러오지 못했습니다.")
    }

    return data
}

// http://127.0.0.1:3000/admin/users/6a702d8ca2d7700555a2d6d6/todo-achievement-trend?type=monthly&start=2026-08-01&end=2026-08-04
// todo 추이 가져오기
export async function getTodoTrend(type,start,end,userId){
    const token = localStorage.getItem("token")

    let url = `${API_URL}/admin/users/${userId}/todo-achievement-trend?type=${type}&start=${start}&end=${end}`

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "총 todo 추이를 불러오지 못했습니다.")
    }

    return data
}