import jwt from "jsonwebtoken"
import { config } from "../config.mjs"
import * as authRepository from "../repository/auth.js"

const AUTH_ERROR = { message: "인증오류" }
const FORBIDDEN_ERROR = { message: "관리자 권한이 필요합니다" }

// 로그인 유지 체크
export const isAuth = async (req, res, next) => {
    const authHeader = req.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("헤더오류 by isAuth")
        return res.status(401).json(AUTH_ERROR)
    }

    // 인증 토큰이 존재한다면
    const token = authHeader.split(" ")[1]
    jwt.verify(token, config.jwt.secretKey, async (error, decoded) => {
        if (error) {
            console.log("Token Error")
            return res.status(401).json(AUTH_ERROR)
        }

        const user = await authRepository.findById(decoded.id)
        if (!user) {
            console.log("해당 ID 없음")
            return res.status(401).json(AUTH_ERROR)
        }

        // 탈퇴 회원 차단
        if (user.useYn === "N") {
            console.log("탈퇴한 회원")
            return res.status(401).json({
                message: "탈퇴한 회원입니다."
            })
        }

        req.user = user
        req.token = token
        next()
    })
}

// 관리자 권한 체크 (isAuth 다음에 적용)
export const isAdmin = (req, res, next) => {
    // console.log("req.user:", req.user)
    // console.log("req.user.role:", req.user?.role)
    // console.log("role type:", typeof req.user?.role)

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