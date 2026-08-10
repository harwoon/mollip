import { API_URL } from "../../../../config/apiUrl.js"

function authHeaders() {
    const token = localStorage.getItem("token")
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    }
}

// 그룹 목록 조회
export async function getGroups() {
    const response = await fetch(`${API_URL}/admin/groups`, {
        method: "GET",
        headers: authHeaders()
    })

    const data = await response.json()
    if(!response.ok) {
        throw new Error(data.message || "그룹 목록을 불러오지 못했습니다.")
    }

    return data
}

// 그룹별 총 공부시간 조회
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
// 그룹 아이디로 그룹 조회
export async function getGroup(groupId){
        const response = await fetch(`${API_URL}/admin/groups/${groupId}`, {
        method: "GET",
        headers: authHeaders()
    })

    const data = await response.json()
    if(!response.ok) {
        throw new Error(data.message || "그룹 정보를 불러오지 못했습니다.")
    }

    return data
}

// 그룹 생성
export async function createGroup(groupData) {
    const response = await fetch(`${API_URL}/admin/groups`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(groupData)
    })

    const data = await response.json()
    if(!response.ok) {
        throw new Error(data.message || "그룹 생성에 실패했습니다.")
    }

    return data
}

// 주간 그룹 임의 재배치 실행
export async function runWeeklyGroupAssignment() {
    const response = await fetch(`${API_URL}/admin/assign-weekly`, {
        method: "POST",
        headers: authHeaders()
    })

    const data = await response.json()
    if(!response.ok) {
        throw new Error(data.message || "주간 그룹 재배치에 실패했습니다.")
    }

    return data
}

// 그룹 수정
export async function updateGroup(id, groupData) {
    const response = await fetch(`${API_URL}/admin/groups/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(groupData)
    })

    const data = await response.json()
    if(!response) {
        throw new Error(data.message || "그룹 수정에 실패했습니다.")
    }

    return data
}
