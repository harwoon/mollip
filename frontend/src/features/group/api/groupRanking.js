const API_URL = import.meta.env.VITE_LOCAL_API_URL

export async function getWeeklyGroupRanking() {
    const token =
        localStorage.getItem("token")

    const response = await fetch(
        `${API_URL}/statistics/weekly-ranking`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
            "주간 랭킹을 불러오지 못했습니다.",
        )
    }

    return Array.isArray(data.ranking)
        ? data.ranking
        : []
}