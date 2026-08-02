const API_URL = import.meta.env.VITE_LOCAL_API_URL

// 백 완료 전까지 보류
// 유저 정보 조회
// export async function getUserInfo() {
//     const token = localStorage.getItem("token")

//     const response = await fetch(`${API_URL}/admin/user`, {
//         method: "GET",
//         headers: {
//             Authorization: `Bearer ${token}`
//         }
//     })

//     const data = await response.json()

//     if(!response.ok) {
//         throw new Error(data.message || "유저 정보를 가져오지 못했습니다.")
//     }

//     return data
// }
