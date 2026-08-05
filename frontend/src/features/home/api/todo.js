import { API_URL } from "../../../config/apiUrl.js"
import { getCurrentDate } from "../../../../util/date"

// Todo 조회
export async function getTodoList() {
  const token = localStorage.getItem("token")
  const date = getCurrentDate()

  const response = await fetch(`${API_URL}/todo/records?type=daily&date=${date}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Todo 목록을 불러오지 못했습니다.")
  }

  return data
}

// Todo 상태 변경
export async function updateTodoState(todoId, state) {
  const token = localStorage.getItem("token")

  const response = await fetch(`${API_URL}/todo/${todoId}/state`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ state }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Todo 상태를 변경하지 못했습니다.")
  }

  return data
}

// Todo 추가
export async function addTodo(todo) {
  const token = localStorage.getItem("token")

  const response = await fetch(`${API_URL}/todo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      todo,
      todoDate: getCurrentDate(),
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Todo를 생성하지 못했습니다.")
  }

  return data
}

// Todo 삭제
export async function deleteTodo(todoId) {
  const token = localStorage.getItem("token")

  const response = await fetch(`${API_URL}/todo/${todoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Todo를 삭제하지 못했습니다.")
  }

  return data
}