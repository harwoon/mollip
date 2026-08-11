import { API_URL } from "../../../../config/apiUrl.js"

function authHeaders() {
    const token = localStorage.getItem("token")
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    }
}

// 회원 목록 조회 (검색/필터/정렬/페이지네이션)
export async function getUsers({ search, groupId, sortBy, sortOrder, page, limit, status } = {}) {
    // URLSearchParams: 값이 있는 파라미터만 골라서 쿼리스트링으로 자동 조립
    const params = new URLSearchParams()

    if (search) params.append("search", search)
    if (groupId) params.append("groupId", groupId)
    if (sortBy) params.append("sortBy", sortBy)
    if (sortOrder) params.append("sortOrder", sortOrder)
    if (page) params.append("page", page)
    if (limit) params.append("limit", limit)
    if (status) params.append("status", status)

    const response = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
        method: "GET",
        headers: authHeaders()
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || "회원 목록을 불러오지 못했습니다.")
    }

    return data
}

// 회원 상세 조회
export async function getUserDetail(id) {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: "GET",
        headers: authHeaders()
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || "회원 상세 정보를 불러오지 못했습니다.")
    }

    return data
}

// 현재 공부 중인 사용자 ID 목록 조회
export async function getActiveUsers() {
    const response = await fetch(`${API_URL}/admin/users/active`, {
        method: "GET",
        headers: authHeaders()
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
}

// 엑셀 다운로드용 전체 회원 목록 조회 (페이지네이션 없음)
export async function getUsersExportData({ search, groupId, status, sortBy, sortOrder } = {}) {
    const params = new URLSearchParams()

    if (search) params.append("search", search)
    if (groupId) params.append("groupId", groupId)
    if (sortBy) params.append("sortBy", sortBy)
    if (sortOrder) params.append("sortOrder", sortOrder)
    if (status) params.append("status", status)

    const response = await fetch(`${API_URL}/admin/users/export?${params.toString()}`, {
        method: "GET",
        headers: authHeaders()
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || "엑셀 데이터를 불러오지 못했습니다.")
    }

    return data
}

// 전체 회원 수
// http://127.0.0.1:3000/admin/users/count
export async function getUsersCount() {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_URL}/admin/users/count`, {
        method: "GET",
        headers: authHeaders()
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "전체 회원 수를 불러오지 못했습니다.")
    }

    const { normalUserCount, dormantUserCount } = data


    return { normalUserCount, dormantUserCount }
}

// 이번주 공부한 회원, 이번주 평균 공부시간
// http://127.0.0.1:3000/admin/weekly-average-study-time
export async function getUsersAverage() {
    const response = await fetch(
        `${API_URL}/admin/weekly-average-study-time`,
        {
            method: "GET",
            headers: authHeaders()
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
            "이번주 공부 데이터를 불러오지 못했습니다."
        )
    }

    const {
        studyUserCount,
        averageWeeklyStudyTime
    } = data

    const hours =
        Math.floor(averageWeeklyStudyTime / 60)

    const minutes =
        Math.round(averageWeeklyStudyTime % 60)

    let formattedAverageTime

    if (hours > 0 && minutes > 0) {
        formattedAverageTime =
            `${hours}시간 ${minutes}분`
    } else if (hours > 0) {
        formattedAverageTime =
            `${hours}시간`
    } else {
        formattedAverageTime =
            `${minutes}분`
    }

    return {
        studyUserCount,
        averageWeeklyStudyTime:
            formattedAverageTime
    }
}