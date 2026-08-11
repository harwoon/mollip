import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import GoogleLoginButton from "./GoogleLoginButton"
import { loginUser } from "../api/auth"
import { consumeAuthNotice } from "../authSessionMonitor.js"
import DormantVerificationModal from "./DormantVerificationModal"
import AppAlert from "../../../components/common/AppAlert.jsx"

import { PiX } from "react-icons/pi"

import styles from "./LoginForm.module.css"

export default function LoginForm() {
    const [userId, setUserId] = useState("")
    const [userPw, setUserPw] = useState("")

    const [alertMessage, setAlertMessage] = useState(() => consumeAuthNotice())
    const [dormantVerification, setDormantVerification] = useState(null)
    const [loginConflict, setLoginConflict] = useState(null)
    const [isReplacingSession, setIsReplacingSession] = useState(false)

    const navigate = useNavigate()
    const moveAfterLogin = (
        result,
    ) => {
        const role =
            result.user.role

        if (role === "admin") {
            navigate(
                "/admin/home",
            )

            return
        }

        navigate("/home")
    }

    const handleLoginError = (error) => {
        if (error?.code === "ACTIVE_SESSION_EXISTS") {
            setAlertMessage("")
            setLoginConflict(error)
            return
        }
        if (error?.code === "DORMANT_ACCOUNT") {
            setAlertMessage("")
            setDormantVerification(error)
            return
        }
        setAlertMessage(error?.message || "로그인에 실패했습니다.")
    }

    const confirmSessionReplacement = async () => {
        if (!loginConflict?.confirmLogin || isReplacingSession) return

        setIsReplacingSession(true)
        try {
            const result = await loginConflict.confirmLogin()
            setLoginConflict(null)
            moveAfterLogin(result)
        } catch (error) {
            setLoginConflict(null)
            handleLoginError(error)
        } finally {
            setIsReplacingSession(false)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const trimmedUserId = userId.trim()

        if (!trimmedUserId) {
            setAlertMessage("아이디를 입력해주세요.")
            return
        }

        if (!userPw) {
            setAlertMessage("비밀번호를 입력해주세요.")
            return
        }

        try {
            const result = await loginUser(
                trimmedUserId,
                userPw,
            )

            moveAfterLogin(result)
            // 로그인한 사용자의 역할 확인
            const role = result.user.role

            // 관리자와 일반 사용자의 홈 경로 분리
            if (role === "admin") {
                navigate("/admin/home")
                return
            }

            localStorage.setItem("user", JSON.stringify(result.user))

            navigate("/home")
        } catch (error) {
            handleLoginError(error)
        }
    }

    return (
        <>
            <form
                className={styles.form}
                onSubmit={handleSubmit}
            >
                <div className={styles.inputGroup}>
                    <label
                        className={styles.label}
                        htmlFor="login-user-id"
                    >
                        아이디
                    </label>

                    <input
                        id="login-user-id"
                        className={styles.input}
                        type="text"
                        value={userId}
                        onChange={(event) =>
                            setUserId(event.target.value)
                        }
                        placeholder="아이디"
                        autoComplete="username"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label
                        className={styles.label}
                        htmlFor="login-user-password"
                    >
                        비밀번호
                    </label>

                    <input
                        id="login-user-password"
                        className={styles.input}
                        type="password"
                        value={userPw}
                        onChange={(event) =>
                            setUserPw(event.target.value)
                        }
                        placeholder="비밀번호"
                        autoComplete="current-password"
                    />
                </div>

                <button
                    className={styles.loginButton}
                    type="submit"
                >
                    로그인
                </button>

                <div
                    style={{
                        marginTop: "20px",
                        display: "flex",
                        justifyContent:
                            "center",
                    }}
                >
                    <GoogleLoginButton
                        onSuccess={
                            moveAfterLogin
                        }
                        onError={
                            handleLoginError
                        }
                    />
                </div>

                <p
                    className={
                        styles.signupGuide
                    }
                ></p>

                <p className={styles.signupGuide}>
                    아직 계정이 없으신가요?

                    <Link to="/signup">
                        회원가입
                    </Link>
                </p>
            </form>

            {alertMessage && (
                <div
                    className={styles.alertOverlay}
                    role="presentation"
                >
                    <section
                        className={styles.alertModal}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="login-alert-title"
                    >
                        <div className={styles.alertHeader}>
                            <strong id="login-alert-title">
                                알림
                            </strong>

                            <button
                                type="button"
                                className={
                                    styles.alertCloseButton
                                }
                                onClick={() =>
                                    setAlertMessage("")
                                }
                                aria-label="알림 닫기"
                            >
                                <PiX aria-hidden="true" />
                            </button>
                        </div>

                        <p className={styles.alertText}>
                            {alertMessage}
                        </p>

                        <button
                            type="button"
                            className={
                                styles.alertConfirmButton
                            }
                            onClick={() =>
                                setAlertMessage("")
                            }
                        >
                            확인
                        </button>
                    </section>
                </div>
            )}
            <DormantVerificationModal
                key={dormantVerification?.verificationId || "closed"}
                verification={dormantVerification}
                onClose={() => setDormantVerification(null)}
                onVerified={moveAfterLogin}
            />
            <AppAlert
                open={Boolean(loginConflict)}
                type="warning"
                title="다른 기기에서 로그인 중"
                message={`다른 기기에 ${loginConflict?.accountId || "해당 계정"}가 로그인중입니다. 해당 연결을 끊고 로그인하시겠습니까?`}
                showCancel
                showClose
                confirmText={isReplacingSession ? "연결 중..." : "연결 끊고 로그인"}
                cancelText="취소"
                onConfirm={confirmSessionReplacement}
                onCancel={() => setLoginConflict(null)}
                onClose={() => setLoginConflict(null)}
            />
        </>
    )
}
