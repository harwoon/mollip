import crypto from "crypto"

import { config } from "../config.mjs"
import * as authRepository from "../repository/auth.js"
import * as groupRepository from "../repository/group.js"
import { createJwtToken } from "../util/jwt.js"
import transporter from "../util/mailer.js"

const CODE_TTL_MS = 5 * 60 * 1000
const RESEND_COOLDOWN_MS = 30 * 1000
const MAX_ATTEMPTS = 5

// 현재 애플리케이션은 단일 Node 서버이므로 인증 정보를 메모리에 임시 저장합니다.
// 운영 환경에서는 Redis 같은 TTL 기반 저장소 사용을 권장합니다.
const dormantVerificationStore = new Map()

function createCode() {
    return crypto.randomInt(100000, 1000000).toString()
}

function maskEmail(email) {
    const [local, domain] = String(email).split("@")
    if (!domain) return "***"
    const visible = local.slice(0, Math.min(2, local.length))
    return `${visible}${"*".repeat(Math.max(3, local.length - visible.length))}@${domain}`
}

async function sendDormantVerificationMail({ email, nickname, code }) {
    return transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: email,
        subject: "[Mollip] 휴면 계정 인증번호 안내",
        text: `안녕하세요, ${nickname}님.\n\n휴면 계정 해제를 위한 인증번호입니다.\n\n[ ${code} ]\n\n인증번호는 5분 동안 유효합니다.\n\n본인이 요청하지 않은 경우 이 메일을 무시해 주세요.`,
    })
}

export function isDormantUser(user) {
    return String(user?.groupId) === String(config.group.dormantId)
}

export async function beginDormantVerification(user) {
    const verificationId = crypto.randomUUID()
    const code = createCode()
    const now = Date.now()

    dormantVerificationStore.set(verificationId, {
        userId: user._id.toString(),
        code,
        expiresAt: now + CODE_TTL_MS,
        attempts: 0,
        lastSentAt: now,
    })

    try {
        await sendDormantVerificationMail({
            email: user.email,
            nickname: user.nickname,
            code,
        })
    } catch (error) {
        dormantVerificationStore.delete(verificationId)
        throw error
    }

    return {
        code: "DORMANT_ACCOUNT",
        message: "휴면 계정입니다. 이메일 인증이 필요합니다.",
        verificationId,
        maskedEmail: maskEmail(user.email),
    }
}

export async function verifyDormantCode(verificationId, submittedCode) {
    const verification = dormantVerificationStore.get(verificationId)
    if (!verification) {
        return { status: 404, message: "인증 요청을 찾을 수 없습니다. 다시 로그인해 주세요." }
    }

    if (Date.now() > verification.expiresAt) {
        dormantVerificationStore.delete(verificationId)
        return { status: 410, message: "인증번호가 만료되었습니다. 다시 로그인해 주세요." }
    }

    if (verification.attempts >= MAX_ATTEMPTS) {
        dormantVerificationStore.delete(verificationId)
        return { status: 429, message: "인증 시도 횟수를 초과했습니다. 새 인증번호를 발급받아 주세요." }
    }

    if (verification.code !== String(submittedCode ?? "").trim()) {
        verification.attempts += 1
        if (verification.attempts >= MAX_ATTEMPTS) {
            dormantVerificationStore.delete(verificationId)
        }
        return { status: 400, message: "인증번호가 올바르지 않습니다." }
    }

    const user = await authRepository.findById(verification.userId)
    if (!user || user.useYn !== "Y") {
        dormantVerificationStore.delete(verificationId)
        return { status: 404, message: "회원 정보를 찾을 수 없습니다." }
    }
    if (!isDormantUser(user)) {
        dormantVerificationStore.delete(verificationId)
        return { status: 409, message: "이미 휴면 상태가 해제된 계정입니다." }
    }

    const defaultGroup = await groupRepository.getLowestRegularGroup()
    if (!defaultGroup) {
        return { status: 500, message: "복귀할 기본 그룹을 찾을 수 없습니다." }
    }

    const updatedUser = await authRepository.reactivateDormantGroupOnly(
        user._id,
        defaultGroup._id,
    )
    if (!updatedUser) {
        dormantVerificationStore.delete(verificationId)
        return { status: 409, message: "이미 휴면 상태가 해제된 계정입니다." }
    }

    dormantVerificationStore.delete(verificationId)
    const token = createJwtToken(updatedUser._id.toString())
    const userObject = updatedUser.toObject()
    const { userPw: _, ...safeUser } = userObject

    return {
        status: 200,
        data: {
            message: "휴면 계정이 해제되었습니다.",
            token,
            user: safeUser,
        },
    }
}

export async function resendDormantCode(verificationId) {
    const verification = dormantVerificationStore.get(verificationId)
    if (!verification) {
        return { status: 404, message: "인증 요청을 찾을 수 없습니다. 다시 로그인해 주세요." }
    }

    const now = Date.now()
    const retryAfterMs = RESEND_COOLDOWN_MS - (now - verification.lastSentAt)
    if (retryAfterMs > 0) {
        return {
            status: 429,
            message: `${Math.ceil(retryAfterMs / 1000)}초 후 다시 시도해 주세요.`,
        }
    }

    const user = await authRepository.findById(verification.userId)
    if (!user || user.useYn !== "Y" || !isDormantUser(user)) {
        dormantVerificationStore.delete(verificationId)
        return { status: 409, message: "유효한 휴면 계정이 아닙니다." }
    }

    const code = createCode()
    await sendDormantVerificationMail({ email: user.email, nickname: user.nickname, code })
    verification.code = code
    verification.expiresAt = now + CODE_TTL_MS
    verification.attempts = 0
    verification.lastSentAt = now

    return { status: 200, data: { message: "인증번호를 다시 전송했습니다." } }
}
