const API_URL = import.meta.env.VITE_LOCAL_API_URL

// Todo 조회
export async function getTodoList() {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/todo`, {
        headers: { Authorization: `Bearer ${token}` }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "todo 목록을 불러오지 못했습니다."
        )
    }
    return data
}

// Todo 상태 변화
export async function updateTodoState(todoId) {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/${todoId}/state`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "todo 목록을 불러오지 못했습니다."
        )
    }
    return data
}