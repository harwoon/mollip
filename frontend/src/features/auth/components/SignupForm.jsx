import { useState, useRef } from "react"
import {Link, useNavigate} from "react-router-dom"
import {checkIdUser,signupUser} from "../api/auth"

import {PiCamera, PiUser, PiX} from "react-icons/pi"
import styles from "./SignupForm.module.css"

export default function SignupForm() {
    const [userId, setUserId] = useState("")
    const [userPw, setUserPw] = useState("")
    const [userPwRe, setUserPwRe] = useState("")
    const [nickname, setNickname] = useState("")
    const [email, setEmail] = useState("")

    const [idCheck, setIdCheck] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")
    const [moveToLoginAfterAlert, setMoveToLoginAfterAlert] = useState(false)

    const [profileFile, setProfileFile] = useState(null)
    const [profilePreview, setProfilePreview] = useState("")

    const profileInputRef = useRef(null)

    const navigate = useNavigate()

    const showAlert = (message) => {
        setAlertMessage(message)
    }

    const handleIdCheck = async () => {
        const trimmedUserId = userId.trim()

        if (!trimmedUserId) {
            showAlert("아이디를 입력해주세요.")
            return
        }

        try {
            const check = await checkIdUser(
                trimmedUserId
            )

            if (check.exists === true) {
                showAlert(
                    "이미 존재하는 아이디입니다."
                )

                setIdCheck(false)
                return
            }

            if (check.exists === false) {
                showAlert(
                    "사용 가능한 아이디입니다."
                )

                setIdCheck(true)
            }
        } catch (error) {
            showAlert(
                "아이디 중복 체크 실패: " +
                error.message
            )
        }
    }

    const handleProfileButtonClick = () => {
        profileInputRef.current?.click()
    }

    const handleProfileChange = (event) => {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        if (!file.type.startsWith("image/")) {
            showAlert("이미지 파일만 선택할 수 있습니다.")
            event.target.value = ""
            return
        }

        const maxFileSize = 5 * 1024 * 1024

        if (file.size > maxFileSize) {
            showAlert("프로필 이미지는 5MB 이하만 선택할 수 있습니다.")
            event.target.value = ""
            return
        }

        if (profilePreview) {
            URL.revokeObjectURL(profilePreview)
        }

        const previewUrl = URL.createObjectURL(file)

        setProfileFile(file)
        setProfilePreview(previewUrl)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const trimmedUserId = userId.trim()
        const trimmedNickname = nickname.trim()
        const trimmedEmail = email.trim()

        if (!trimmedUserId) {
            showAlert("아이디를 입력해주세요.")
            return
        }

        if (!idCheck) {
            showAlert(
                "아이디 중복 확인을 해주세요."
            )
            return
        }

        if (!userPw) {
            showAlert("비밀번호를 입력해주세요.")
            return
        }

        if (userPw !== userPwRe) {
            showAlert(
                "비밀번호가 일치하지 않습니다."
            )
            return
        }

        if (!trimmedNickname) {
            showAlert("닉네임을 입력해주세요.")
            return
        }

        if (!trimmedEmail) {
            showAlert("이메일을 입력해주세요.")
            return
        }

        try {
            await signupUser(
                trimmedUserId,
                userPw,
                trimmedNickname,
                trimmedEmail,
                profileFile
            )

            setMoveToLoginAfterAlert(true)
            showAlert("회원가입이 완료되었습니다. \n로그인을 진행해주세요.")

            // navigate("/")
        } catch (error) {
            showAlert(
                "회원가입 실패: " +
                error.message
            )
        }
    }

    const handleAlertConfirm = () => {
        setAlertMessage("")

        if (moveToLoginAfterAlert) {
            setMoveToLoginAfterAlert(false)
            navigate("/")
        }
    }

    return (
        <>
            <form
                className={styles.form}
                onSubmit={handleSubmit}
            >
                <div className={styles.profileArea}>
                    <div className={styles.profilePreview}>
                        {profilePreview ? (
                            <img
                                className={styles.profileImage}
                                src={profilePreview}
                                alt="선택한 프로필 미리보기"
                            />
                        ) : (
                            <PiUser aria-hidden="true" />
                        )}
                    </div>

                    <input
                        ref={profileInputRef}
                        className={styles.profileInput}
                        type="file"
                        accept="image/*"
                        onChange={handleProfileChange}
                    />

                    <button
                        className={styles.profileButton}
                        type="button"
                        onClick={handleProfileButtonClick}
                    >
                        <PiCamera aria-hidden="true" />
                        프로필 이미지 선택
                    </button>
                </div>

                <div className={styles.idRow}>
                    <input
                        className={styles.input}
                        type="text"
                        value={userId}
                        onChange={(event) => {
                            setUserId(event.target.value)
                            setIdCheck(false)
                        }}
                        placeholder="아이디"
                        autoComplete="username"
                    />

                    <button
                        className={styles.checkButton}
                        type="button"
                        onClick={handleIdCheck}
                    >
                        중복확인
                    </button>
                </div>

                <input
                    className={styles.input}
                    type="password"
                    value={userPw}
                    onChange={(event) =>
                        setUserPw(event.target.value)
                    }
                    placeholder="비밀번호"
                    autoComplete="new-password"
                />

                <input
                    className={styles.input}
                    type="password"
                    value={userPwRe}
                    onChange={(event) =>
                        setUserPwRe(event.target.value)
                    }
                    placeholder="비밀번호 재확인"
                    autoComplete="new-password"
                />

                <input
                    className={styles.input}
                    type="text"
                    value={nickname}
                    onChange={(event) =>
                        setNickname(event.target.value)
                    }
                    placeholder="닉네임"
                />

                <input
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    placeholder="이메일"
                    autoComplete="email"
                />

                <button
                    className={styles.signupButton}
                    type="submit"
                >
                    회원가입
                </button>

                <p className={styles.loginGuide}>
                    이미 계정이 있으신가요?

                    <Link to="/">
                        로그인
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
                        aria-labelledby="signup-alert-title"
                    >
                        <div className={styles.alertHeader}>
                            <strong id="signup-alert-title">
                                알림
                            </strong>

                            <button
                                type="button"
                                className={
                                    styles.alertCloseButton
                                }
                                // onClick={() => setAlertMessage("")}
                                onClick={handleAlertConfirm}
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
                            className={styles.alertConfirmButton}
                            onClick={handleAlertConfirm}
                        >
                            확인
                        </button>
                    </section>
                </div>
            )}
        </>
    )
}