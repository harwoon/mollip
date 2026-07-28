import * as authRepository from "../repository/auth.js"

function formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

export async function resetExpiredStreaks() {
    const yesterday = new Date()

    yesterday.setDate(
        yesterday.getDate() - 1
    )

    const yesterdayString = formatDate(yesterday)

    console.log("어제 날짜:", yesterdayString)

    return authRepository.resetExpiredStreaks(
        yesterdayString
    )
}