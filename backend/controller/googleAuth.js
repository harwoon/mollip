import { OAuth2Client } from "google-auth-library"
import { config } from "../config.mjs"
import { createJwtToken } from "../util/jwt.js"
import * as authRepository from "../repository/auth.js"

const googleClient =
    new OAuth2Client(
        config.google.clientId,
    )

export async function googleLogin(
    req,
    res,
) {
    const { credential } = req.body

    if (!credential) {
        return res.status(400).json({
            message:
                "Google 인증 정보가 없습니다.",
        })
    }

    try {
        /*
         * 1. Google 토큰 검증
         */
        const ticket =
            await googleClient
                .verifyIdToken({
                    idToken:
                        credential,

                    audience:
                        config.google
                            .clientId,
                })

        /*
         * 2. 검증된 사용자 정보
         */
        const payload =
            ticket.getPayload()

        const googleId =
            payload?.sub

        const email =
            payload?.email
                ?.trim()
                .toLowerCase()

        const nickname =
            payload?.name
                ?.trim()

        const profileImg =
            payload?.picture

        const emailVerified =
            payload
                ?.email_verified ===
            true

        if (
            !googleId ||
            !email ||
            !emailVerified
        ) {
            return res
                .status(401)
                .json({
                    message:
                        "인증된 Google 계정이 아닙니다.",
                })
        }

        /*
         * 3. 기존 Google 회원 조회
         */
        let user =
            await authRepository
                .findByGoogleId(
                    googleId,
                )

        let isNewUser = false

        /*
         * 4. 처음 로그인한 계정
         */
        if (!user) {
            const emailUser =
                await authRepository
                    .findByEmail(
                        email,
                    )

            /*
             * 기존 일반회원과
             * 같은 이메일이면 자동 연결 안 함
             */
            if (emailUser) {
                return res
                    .status(409)
                    .json({
                        message:
                            "같은 이메일로 가입된 계정이 있습니다. 기존 계정으로 로그인해주세요.",
                    })
            }

            /*
             * User.userId가 필수이므로
             * 내부용 아이디 생성
             */
            const googleUserId =
                `google_${googleId}`

            user =
                await authRepository
                    .createGoogleUser({
                        userId:
                            googleUserId,

                        nickname:
                            nickname ||
                            email.split(
                                "@",
                            )[0],

                        email,

                        profileImg:
                            profileImg ||
                            "/images/noprofile.png",

                        authProvider:
                            "google",

                        googleId,

                        role: "user",
                    })

            isNewUser = true
        }

        /*
         * 5. Mollip JWT 발급
         */
        const token =
            createJwtToken(
                user._id.toString(),
            )

        /*
         * 6. 비밀번호 제외
         */
        const userObject =
            user.toObject()

        const {
            userPw: _,
            ...safeUser
        } = userObject

        return res
            .status(200)
            .json({
                message:
                    isNewUser
                        ? "Google 회원가입 및 로그인 성공"
                        : "Google 로그인 성공",

                isNewUser,
                token,
                user: safeUser,
            })
    } catch (error) {
        console.error(
            "Google 로그인 실패:",
            error,
        )

        if (error.code === 11000) {
            return res
                .status(409)
                .json({
                    message:
                        "이미 가입된 Google 계정입니다.",
                })
        }

        return res
            .status(401)
            .json({
                message:
                    "Google 인증에 실패했습니다.",
            })
    }
}