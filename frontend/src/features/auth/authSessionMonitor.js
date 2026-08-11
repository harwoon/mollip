import { API_URL } from "../../config/apiUrl.js"

const SESSION_REPLACED_CODE = "SESSION_REPLACED"
const AUTH_STORAGE_KEYS = ["token", "role", "groupId", "userId", "user"]
const CHECK_INTERVAL_MS = 15_000

let redirecting = false

function clearLoginData() {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
}

function redirectToLogin() {
    if (redirecting) return

    redirecting = true
    clearLoginData()
    sessionStorage.setItem(
        "authNotice",
        "다른 기기에서 새로 로그인되어 현재 기기의 로그인이 종료되었습니다.",
    )

    if (window.location.pathname !== "/login") {
        window.location.replace("/login")
    } else {
        window.location.reload()
    }
}

async function handleAuthResponse(response) {
    if (response.status !== 401) return

    try {
        const data = await response.clone().json()
        if (data?.code === SESSION_REPLACED_CODE) redirectToLogin()
    } catch {
        // JSON 응답이 아닌 일반 네트워크 오류는 기존 API 처리에 맡깁니다.
    }
}

export function installAuthSessionMonitor() {
    const originalFetch = window.fetch.bind(window)

    window.fetch = async (...args) => {
        const response = await originalFetch(...args)
        await handleAuthResponse(response)
        return response
    }

    const checkSession = async () => {
        const token = localStorage.getItem("token")
        if (!token || redirecting) return

        try {
            const response = await originalFetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            await handleAuthResponse(response)
        } catch {
            // 일시적인 네트워크 단절만으로 사용자를 로그아웃시키지 않습니다.
        }
    }

    window.setInterval(checkSession, CHECK_INTERVAL_MS)
    window.addEventListener("focus", checkSession)
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkSession()
    })
}

export function consumeAuthNotice() {
    const notice = sessionStorage.getItem("authNotice") || ""
    sessionStorage.removeItem("authNotice")
    return notice
}
