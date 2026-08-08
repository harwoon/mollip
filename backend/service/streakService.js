import * as authRepository from "../repository/auth.js"
import { formatDate } from "../util/date.js"

export async function resetExpiredStreaks() {
    const yesterday = new Date()

    yesterday.setDate(yesterday.getDate() - 1)

    const yesterdayString = formatDate(yesterday)

    return authRepository.resetExpiredStreaks(
        yesterdayString
    )
}