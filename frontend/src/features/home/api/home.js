import { getCurrentDate } from "../../../../util/date"

const API_URL = import.meta.env.VITE_LOCAL_API_URL;

const token = localStorage.getItem("token");

// Todo 조회
export async function getTodoList() {
    const date = getCurrentDate()
  const response = await fetch(`${API_URL}/todo/records?type=daily&date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "todo 목록을 불러오지 못했습니다.");
  }
  return data;
}

// Todo 상태 변화
export async function updateTodoState(todoId, state) {
  const response = await fetch(`${API_URL}/todo/${todoId}/state`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      state: state,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "todo 목록을 불러오지 못했습니다.");
  }
  return data;
}

// Todo 추가

export async function addTodo(todo) {
    
  const response = await fetch(`${API_URL}/todo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
       todo: todo,
       todoDate: getCurrentDate()
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "todo를 생성하지 못했습니다.");
  }
  return data;
}

// Todo 삭제
export async function deleteTodo(todoId) {
  const response = await fetch(`${API_URL}/todo/${todoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "todo 목록을 불러오지 못했습니다.");
  }
  return data;
}
