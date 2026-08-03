import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import GoogleLoginButton from "./GoogleLoginButton"
import { loginUser } from "../api/auth"

import { PiX } from "react-icons/pi"

import styles from "./LoginForm.module.css"

export default function LoginForm() {
    const [userId, setUserId] = useState("")
    const [userPw, setUserPw] = useState("")

    const [alertMessage, setAlertMessage] = useState("")

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
            setAlertMessage(
                error.message ||
                "아이디 또는 비밀번호를 확인해주세요."
            )
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
                            setAlertMessage
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
        </>
    )
}