// src/features/admin/api/adminUserApi.js

const API_URL =
  import.meta.env.VITE_LOCAL_API_URL

export async function getAllAdminUsers() {
  const token = localStorage.getItem("token")

  const response = await fetch(
    `${API_URL}/admin/users?page=1&limit=1000`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!response.ok) {
    throw new Error(
      `회원 목록 조회 실패: ${response.status}`
    )
  }

  const data = await response.json()

  return data.users ?? []
}