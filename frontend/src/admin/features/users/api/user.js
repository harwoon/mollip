const API_URL = import.meta.env.VITE_LOCAL_API_URL

function authHeaders() {
    const token = localStorage.getItem("token")
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    }
}

// 회원 목록 조회 (검색/필터/정렬/페이지네이션)
export async function getUsers({ search, groupId, sortBy, sortOrder, page, limit } = {}) {
    // URLSearchParams: 값이 있는 파라미터만 골라서 쿼리스트링으로 자동 조립
    const params = new URLSearchParams()

    if (search) params.append("search", search)
    if (groupId) params.append("groupId", groupId)
    if (sortBy) params.append("sortBy", sortBy)
    if (sortOrder) params.append("sortOrder", sortOrder)
    if (page) params.append("page", page)
    if (limit) params.append("limit", limit)

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

// 현재 공부 중인 유저 ID 목록 조회
export async function getActiveUsers() {
    const response = await fetch(`${API_URL}/admin/users/active`, {
        method: "GET",
        headers: authHeaders()
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
}