import { API_URL } from "../../../config/apiUrl.js"

// 로그인한 사용자의 닉네임과 이메일 수정
export async function updateMyInfo(nickname, email) {

    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("로그인 정보가 없습니다.")
    }

    const response = await fetch(`${API_URL}/auth/me`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            nickname,
            email
        })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || "회원정보 수정에 실패했습니다."
        )
    }

    return data
}


// 프로필 이미지 수정
export async function updateProfileImage(imageFile) {

    const token = localStorage.getItem("token")

    // 이미지 파일은 JSON X, FormData로 전송
    const formData = new FormData()

    // 백엔드 라우터 : uploadProfile.single("profileImage")
    formData.append("profileImage", imageFile)

    // 백엔드 라우터: /profile-image
    const response = await fetch(`${API_URL}/auth/profile-image`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || "프로필 이미지 수정에 실패했습니다."
        )
    }

    return data
}

// 회원 탈퇴
export async function withdrawMyAccount(confirmationText, withdrawalReason) {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/auth/withdraw`,{
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            confirmationText,
            withdrawalReason
        })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message)
    }

    return data
}