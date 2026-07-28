const API_URL = import.meta.env.VITE_LOCAL_API_URL

// 토큰 확인
function getToken() {
    const token = localStorage.getItem("token")
    if(!token){
        throw new Error("로그인 정보가 없습니다.")
    }
    return token
}

// 과목 목록 조회
export async function getSubjects(){
    const token = getToken()

    const response = await fetch(`${API_URL}/auth/subject`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "과목 목록을 불러오지 못했습니다."
        )
    }
    return data
}


// 과목 생성
export async function createSubject(subjectName, subjectColor) {
    const token = getToken()

    const response = await fetch(`${API_URL}/auth/subject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            subjectName,
            subjectColor
        })
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "과목 생성에 실패했습니다."
        )
    }
    return data
}


// 과목 수정
export async function updateSubject(subjectId, subjectName, subjectColor){

    const token = localStorage.getItem("token")
    if(!token){
        throw new Error("로그인 정보가 없습니다.")
    }

    const response = await fetch(`${API_URL}/auth/subject/${subjectId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            subjectName,
            subjectColor
        })
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "과목 수정에 실패했습니다."
        )
    }

    return data
}

// 과목 삭제
export async function deleteSubject(subjectId) {
    const token = getToken()

    const response = await fetch(`${API_URL}/auth/subject`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "과목 삭제에 실패했습니다."
        )
    }
    return data
}


