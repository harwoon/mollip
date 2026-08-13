export async function requestAllGroups({ apiUrl, token, fetcher }) {
    const response = await fetcher(`${apiUrl}/group/groups`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || "그룹 목록을 불러오지 못했습니다."
        )
    }

    return Array.isArray(data.groups) ? data.groups : []
}
