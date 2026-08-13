import { API_URL } from "../../../config/apiUrl.js"
import { requestAllGroups } from "./groupRequest.js"


export function getAllGroups() {
    return requestAllGroups({
        apiUrl: API_URL,
        token: localStorage.getItem("token"),
        fetcher: fetch
    })
}

// 내 그룹 가져오기
export async function getMyGroup() {

    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/group`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "그룹 정보를 불러오지 못했습니다."
        )
    }

    const groupName = data.groupName
    const groupTime = data.groupTime
    
    return {groupName, groupTime}
}

// 상위 그룹 조회
export async function getHigher() {

    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/group/higher`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "상위 그룹 정보를 불러오지 못했습니다."
        )
    }

    const groupName = data.groupName
    const groupTime = data.groupTime
    
    return {groupName, groupTime}
}

// 하위 그룹 조회
export async function getLower() {

    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/group/lower`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "하위 그룹 정보를 불러오지 못했습니다."
        )
    }

    const groupName = data.groupName
    const groupTime = data.groupTime
    
    return {groupName, groupTime}
}

// 사용자 주간 총 공부시간
export async function getWeekStudyTime() {
    const token = localStorage.getItem("token")

    const today = new Date()

    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const date = String(today.getDate()).padStart(2, "0")

    const todayString = `${year}-${month}-${date}`

    const response = await fetch(
        `${API_URL}/statistics/total?type=weekly&date=${todayString}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
            "이번 주 공부시간을 불러오지 못했습니다."
        )
    }

    // 백엔드에서 주간 총 공부시간을 숫자(초)로 반환
    return Number(data) || 0
}

// 사용자 지난주 총 공부시간
export async function getPrevWeekStudyTime() {
    const token = localStorage.getItem("token")

    const today = new Date()
    const prevWeekDate = new Date(today)
    prevWeekDate.setDate(today.getDate() - 7)

    const year = prevWeekDate.getFullYear()
    const month = String(prevWeekDate.getMonth() + 1).padStart(2, "0")
    const date = String(prevWeekDate.getDate()).padStart(2, "0")

    const prevWeekString = `${year}-${month}-${date}`

    const response = await fetch(
        `${API_URL}/statistics/total?type=weekly&date=${prevWeekString}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
            "지난주 공부시간을 불러오지 못했습니다."
        )
    }

    return Number(data) || 0
}
