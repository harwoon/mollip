import jwt from "jsonwebtoken"
import { config } from "../config.mjs"
import * as authRepository from "../repository/auth.js"
import { isCurrentLoginSession } from "../service/loginSessionService.js"

const AUTH_ERROR = { message: "인증오류" }
const FORBIDDEN_ERROR = { message: "관리자 권한이 필요합니다" }
const SESSION_REPLACED_ERROR = {
    code: "SESSION_REPLACED",
    message: "다른 기기에서 새로 로그인되어 현재 기기의 로그인이 종료되었습니다.",
}

// 로그인 유지 체크
export const isAuth = async (req, res, next) => {
    const authHeader = req.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("헤더오류 by isAuth")
        return res.status(401).json(AUTH_ERROR)
    }

    // 인증 토큰이 존재한다면
    const token = authHeader.split(" ")[1]
    try {
        const decoded = jwt.verify(token, config.jwt.secretKey)

        const isCurrentSession = await isCurrentLoginSession(
            decoded.id,
            decoded.sessionId,
        )
        if (!isCurrentSession) {
            console.log("다른 기기의 새 로그인으로 세션 만료")
            return res.status(401).json(SESSION_REPLACED_ERROR)
        }

        const user = await authRepository.findById(decoded.id)
        if (!user) {
            console.log("해당 ID 없음")
            return res.status(401).json(AUTH_ERROR)
        }

        if (user.useYn === "N") {
            console.log("탈퇴한 회원")
            return res.status(401).json({ message: "탈퇴한 회원입니다." })
        }

        req.user = user
        req.token = token
        req.sessionId = decoded.sessionId
        next()
    } catch (error) {
        if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
            console.log("Token Error")
            return res.status(401).json(AUTH_ERROR)
        }
        console.error("로그인 세션 확인 실패:", error)
        return res.status(503).json({ message: "로그인 상태를 확인하지 못했습니다." })
    }
}

// 관리자 권한 체크 (isAuth 다음에 적용)
export const isAdmin = (req, res, next) => {
    // isAuth 없이 단독으로 쓰였을 경우 방지
    if (!req.user) {
        console.log("헤더오류 by isAdmin")
        return res.status(401).json(AUTH_ERROR)
    }

    // role이 admin이 아닌 경우 방지
    if (req.user.role !== "admin") {
        console.log("관리자 권한 필요")
        return res.status(403).json(FORBIDDEN_ERROR)
    }

    next()
}
