import crypto from "crypto"

import { config } from "../config.mjs"
import redisClient from "../db/redis.js"
import { createJwtToken } from "../util/jwt.js"

const SESSION_KEY_PREFIX = "auth:session:"

const getSessionKey = (userId) => `${SESSION_KEY_PREFIX}${String(userId)}`

// 새 로그인 세션을 저장하면서 같은 계정의 이전 세션을 원자적으로 교체합니다.
export async function createLoginSession(userId) {
    const sessionId = crypto.randomUUID()

    await redisClient.set(
        getSessionKey(userId),
        sessionId,
        "EX",
        config.jwt.expiresInSec,
    )

    return createJwtToken(String(userId), sessionId)
}

export async function isCurrentLoginSession(userId, sessionId) {
    if (!sessionId) return false

    const currentSessionId = await redisClient.get(getSessionKey(userId))
    return currentSessionId === sessionId
}

export async function hasActiveLoginSession(userId) {
    return Boolean(await redisClient.get(getSessionKey(userId)))
}

// 이전 기기의 로그아웃 요청이 새 기기의 세션까지 지우지 못하도록 값이 같을 때만 삭제합니다.
export async function deleteLoginSession(userId, sessionId) {
    if (!sessionId) return false

    const deleted = await redisClient.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        end
        return 0`,
        1,
        getSessionKey(userId),
        sessionId,
    )

    return deleted === 1
}
