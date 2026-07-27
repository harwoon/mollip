
export async function loginUser(userId, userPw) {

    const API_URL = import.meta.env.VITE_LOCAL_API_URL

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userPw }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
}