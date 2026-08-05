import { API_URL } from "../../../config/apiUrl.js"

// 로그인한 사용자 정보 조회
export async function getMyInfo() {
    // JWT 토큰 가져옴
    const token = localStorage.getItem("token")

    // 로그인한 사용자 정보 조회 요청
    const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || "회원 정보를 불러오지 못했습니다."
        )
    }

    return data
}

// 로그인
export async function loginUser(userId, userPw) {

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userPw }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)

    saveLoginData(data)

    return data
}

// 회원가입
export async function signupUser(userId, userPw, nickname, email, profileFile) {
    const formData = new FormData()

    formData.append("userId", userId)
    formData.append("userPw", userPw)
    formData.append("nickname", nickname)
    formData.append("email", email)

    // 사용자가 이미지를 선택한 경우에만 파일 전송
    if (profileFile) {
        formData.append(
            "profileImage", profileFile
        )
    }

    const response = await fetch(
        `${API_URL}/auth/signup`,
        {
            method: "POST",
            body: formData
        }
    )
    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || "회원가입에 실패했습니다."
        )
    }
    return data
}

// 아이디 중복 확인
export async function checkIdUser(userId) {
    const response = await fetch(`${API_URL}/auth/checkId?userId=${userId}`, {
        method: "GET"
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)

    return data
}

function saveLoginData(data) {
    localStorage.setItem(
        "token",
        data.token,
    )

    localStorage.setItem(
        "role",
        data.user.role,
    )

    localStorage.setItem(
        "groupId",
        data.user.groupId?._id ??
        data.user.groupId ??
        "",
    )

    localStorage.setItem(
        "userId",
        data.user._id,
    )

    localStorage.setItem(
        "user",
        JSON.stringify(
            data.user,
        ),
    )
}
// 구글 로그인 함수
export async function loginGoogleUser(
    credential,
) {
    const response = await fetch(
        `${API_URL}/auth/google`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                credential,
            }),
        },
    )

    const data =
        await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Google 로그인에 실패했습니다.",
        )
    }

    saveLoginData(data)

    return data
}