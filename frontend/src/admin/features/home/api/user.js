// import axios from "axios"

const API_URL = import.meta.env.VITE_LOCAL_API_URL

// 관리자 - 전체 사용자 수 조회
export async function getUserCount() {
    const token = localStorage.getItem("token")
    
    const response = await fetch(`${API_URL}/admin/users/count`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok) {
        throw new Error(data.message || "전체 사용자 수를 불러오지 못했습니다.")
    }

    return data
}


// 전체 사용자 주간 Todo 달성률
export async function getWeeklyTodoAchievement() {
    const token = localStorage.getItem("token")

    const response = await fetch(
        `${API_URL}/admin/todo-achievement/weekly`,
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
            data.message || "전체 사용자 주간 Todo 달성률을 불러오지 못했습니다."
        )
    }

    return data
}