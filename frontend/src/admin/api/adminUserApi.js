// src/features/admin/api/adminUserApi.js
// import { API_URL } from "../../config/api"

const API_BASE_URL =
     import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000"

export async function getAllAdminUsers() {
     const token = localStorage.getItem("token")

     const response = await fetch(
          `${API_BASE_URL}/admin/users?page=1&limit=1000`,
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


// 관리회원현황 조회
export async function getMemberStatus() {
     const token = localStorage.getItem("token")

     const response = await fetch(
          `${API_BASE_URL}/admin/member-status`,
          {
               method: "GET",
               headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
               }
          }
     )

     const data = await response.json()

     if (!response.ok) {
          throw new Error(
               data.message ||
               `관리회원현황 조회 실패: ${response.status}`
          )
     }

     return data
}


// 7일 / 14일 / 휴면 선택 회원 일괄 메일 발송
export async function sendMemberStatusMail(groups) {
     const token = localStorage.getItem("token")

     const response = await fetch(
          `${API_BASE_URL}/admin/member-status/send-all-mail`,
          {
               method: "POST",
               headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
               },

               // 섹션별 선택 회원 ID 전달
               body: JSON.stringify({
                    groups
               })
          }
     )

     const data = await response.json()

     if (!response.ok) {
          throw new Error(
               data.message ||
               `메일 발송 실패: ${response.status}`
          )
     }

     return data
}