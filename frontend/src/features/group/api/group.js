const API_URL = import.meta.env.VITE_LOCAL_API_URL

// 내 그룹 가져오기
export async function getMyGroup() {

    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "유저 정보를 불러오지 못했습니다."
        )
    }

    const groupId = data.user.groupId

    
    
    return data
}