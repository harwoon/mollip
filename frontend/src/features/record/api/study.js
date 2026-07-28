const API_URL = import.meta.env.VITE_LOCAL_API_URL

// 총 공부시간 가져오기
export async function getStudyRecord(type,date) {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/study/records?type=${type}&date=${date}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "총 공부 시간을 불러오지 못했습니다."
        )
    }
    
    return data
}