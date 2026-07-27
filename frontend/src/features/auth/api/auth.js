const API_URL = import.meta.env.VITE_LOCAL_API_URL

export async function loginUser(userId, userPw) {

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userPw }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
}

export async function signupUser(userId, userPw, nickname, email) {

    const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userPw, nickname, email }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
}

export async function checkIdUser(userId){
    const response = await fetch(`${API_URL}/auth/checkId`,{
        method: "GET",
        body : JSON.stringify({userId})
    })
}