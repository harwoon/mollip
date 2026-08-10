import { getProfileImageUrl } from "../../../util/profileImage.js"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getMyInfo } from "../../auth/api/auth"
import { PiPencilSimpleDuotone } from "react-icons/pi"
import { RiAccountCircle2Fill } from "react-icons/ri"
import { FiLock } from "react-icons/fi"

import { updateMyInfo, updatePassword, updateProfileImage, withdrawMyAccount } from "../api/mypage"
import AppAlert from "../../../components/common/AppAlert.jsx"
import AppModal from "../../../components/common/AppModal.jsx"
import styles from "./UserInfo.module.css"

export default function UserInfo() {
    // 회원 탈퇴 후 로그인 페이지 이동
    const navigate = useNavigate()

    // 프로필 표시할 사용자 정보
    const [user, setUser] = useState({
        nickname: "",
        email: "",
        profileImg: "",
        authProvider: "local"
    })

    // 수정취소, 실패 시 원래 값 되돌리기위한 정보
    const [originalUser, setOriginalUser] = useState({
        nickname: "",
        email: "",
        profileImg: "",
        authProvider: "local"
    })

    // 현재 수정모드인지 확인: 기본값 false
    const [isEditing, setIsEditing] = useState(false)

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: ""
    })

    // 숨겨진 파일 input에 접근
    const fileInputRef = useRef(null)

    // 서버로 전송할 실제 이미지 파일
    const [selectedImageFile, setSelectedImageFile] = useState(null)

    // 사용자가 선택한 이미지의 미리보기 주소
    const [previewImageUrl, setPreviewImageUrl] = useState("")

    // 사용자 정보 화면의 안내/경고/확인 팝업 AppAlert 상태로 통일
    const [alertConfig, setAlertConfig] = useState({
        open: false,
        type: "info",
        title: "",
        message: "",
        showCancel: false,
        confirmText: "확인",
        onConfirm: null
    })

    // 공통 알림 열기
    function showAlert({
        type = "info",
        title,
        message = "",
        showCancel = false,
        confirmText = "확인",
        onConfirm = null
    }) {
        setAlertConfig({
            open: true,
            type,
            title,
            message,
            showCancel,
            confirmText,
            onConfirm
        })
    }

    // 공통 알림 닫기
    function closeAlert() {
        setAlertConfig((previous) => ({
            ...previous,
            open: false,
            onConfirm: null
        }))
    }

    useEffect(() => {
        async function loadMyInfo() {
            try {
                const data = await getMyInfo()

                const userInfo = {
                    nickname: data.user.nickname ?? "",
                    email: data.user.email ?? "",
                    profileImg: data.user.profileImg ?? "",
                    authProvider: data.user.authProvider ?? "local"
                }

                setUser(userInfo)
                setOriginalUser(userInfo)
            } catch (error) {
                console.error("마이페이지 사용자 정보 조회 오류: ", error)
            }
        }
        loadMyInfo()
    }, [])

    // DB에는 /uploads/profile/... 상대경로 저장됨
    // 백엔드 서버 주소를 앞에 붙여 실제 이미지 주소 생성 (구글 프로필처럼 완전한 URL이면 그대로 사용)
    const savedProfileImageUrl = getProfileImageUrl(user.profileImg)

    // 새 이미지 선택 시 미리보기 우선 표시
    const profileImageUrl =
        previewImageUrl || savedProfileImageUrl

    // 닉네임, 이메일 input값 변경
    function handleChange(event) {
        const { name, value } = event.target

        setUser((previousUser) => ({
            ...previousUser,
            [name]: value
        }))
    }

    // 이미지 연필버튼 클릭 시 숨겨진 파일 선택창 열기
    function handleImageEditClick() {
        if (!isEditing) return
        fileInputRef.current?.click()
    }

    // 이미지 파일 선택 시 실행
    function handleImageChange(event) {
        const file = event.target.files?.[0]

        if (!file) return

        // 이미지 파일만 선택 가능
        if (!file.type.startsWith("image/")) {
            // 공통 AppAlert
            showAlert({
                type: "warning",
                title: "이미지 파일을 확인해주세요.",
                message: "이미지 파일만 선택할 수 있습니다."
            })
            event.target.value = ""
            return
        }

        // 기존 미리보기 URL 메모리 해제
        if (previewImageUrl) {
            URL.revokeObjectURL(previewImageUrl)
        }

        setSelectedImageFile(file)
        setPreviewImageUrl(URL.createObjectURL(file))
    }

    // 수정하기, 수정완료 버튼
    async function handleEdit() {
        // 수정모드 아닐경우 = 수정모드로 전환
        if (!isEditing) {
            setIsEditing(true)
            return
        }

        // 수정완료 누르면 입력값 검사
        if (!user.nickname.trim()) {
            // 공통 AppAlert
            showAlert({ type: "warning", title: "닉네임을 입력해주세요." })
            return
        }
        if (!user.email.trim()) {
            // 공통 AppAlert
            showAlert({ type: "warning", title: "이메일을 입력해주세요." })
            return
        }

        // 변경사항 있는지 확인 (닉네임/이메일/이미지 중 하나라도 바뀌었는지 확인)
        const isNicknameChanged = user.nickname.trim() !== originalUser.nickname
        const isEmailChanged = user.email.trim() !== originalUser.email
        const isProfileImgChanged = !!selectedImageFile

        if (!isNicknameChanged && !isEmailChanged && !isProfileImgChanged) {
            // 공통 AppAlert
            showAlert({
                type: "info",
                title: "수정된 내용이 없습니다."
            })
            setIsEditing(true)
            return
        }

        try {
            // 닉네임, 이메일 수정
            const infoData = await updateMyInfo(
                user.nickname.trim(),
                user.email.trim()
            )

            let updatedProfileImg = user.profileImg

            // 새 이미지 선택했을때만 이미지 수정
            if (selectedImageFile) {
                const imageData = await updateProfileImage(
                    selectedImageFile
                )
                updatedProfileImg = imageData.user.profileImg ?? updatedProfileImg
            }

            const updatedUser = {
                nickname: infoData.user.nickname ?? "",
                email: infoData.user.email ?? "",
                profileImg: updatedProfileImg ?? "",
                authProvider: user.authProvider
            }

            // 최신 정보로 갱신
            setUser(updatedUser)
            setOriginalUser(updatedUser)

            // 이미지 선택 상태 초기화
            setSelectedImageFile(null)

            if (previewImageUrl) {
                URL.revokeObjectURL(previewImageUrl)
            }

            setPreviewImageUrl("")

            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }

            // 수정모드 종료
            setIsEditing(false)
            showAlert({
                type: "success",
                title: "회원정보 수정 완료",
                message: infoData.message || "회원정보가 수정되었습니다."
            })

        } catch (error) {
            console.error(
                "회원정보 수정 오류:",
                error
            )
            showAlert({
                type: "danger",
                title: "회원정보 수정 실패",
                message: error.message || "회원정보 수정에 실패했습니다."
            })
        }
    }

    // 수정 취소
    function handleCancel() {
        // 수정 전 정보로 되돌리기
        setUser(originalUser)

        setSelectedImageFile(null)

        if (previewImageUrl) {
            URL.revokeObjectURL(previewImageUrl)
        }

        setPreviewImageUrl("")

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }

        setIsEditing(false)
    }

    // 최종 탈퇴확인 후 API호출 별도 함수 분리
    async function executeWithdraw(confirmationText, withdrawalReason) {
        closeAlert()

        try {
            const data = await withdrawMyAccount(
                confirmationText,
                withdrawalReason.trim()
            )

            localStorage.removeItem("token")
            localStorage.removeItem("role")
            localStorage.removeItem("groupId")
            localStorage.removeItem("userId")
            localStorage.removeItem("user")

            // GPT 수정 - 탈퇴 완료 alert 후 바로 이동하지 않고 확인 버튼을 누르면 로그인 화면으로 이동
            showAlert({
                type: "success",
                title: "회원 탈퇴 완료",
                message: data.message || "회원 탈퇴가 완료되었습니다.",
                onConfirm: () => navigate("/", { replace: true })
            })
        } catch (error) {
            console.error("회원 탈퇴 오류:", error)

            // GPT 수정 - 탈퇴 실패 alert를 공통 위험 알림으로 변경
            showAlert({
                type: "danger",
                title: "회원 탈퇴 실패",
                message: error.message || "회원 탈퇴 처리 중 오류가 발생했습니다."
            })
        }
    }


    // 회원 탈퇴
    async function handleWithdraw() {
        // 탈퇴 확인 문구 입력
        const confirmationText = window.prompt('"탈퇴하겠습니다"를 입력해주세요.')
        // 취소한 경우
        if (confirmationText === null) { return }
        // 확인 문구 검사
        if (confirmationText !== "탈퇴하겠습니다") {
            showAlert({
                type: "warning",
                title: "탈퇴 확인 문구를 확인해주세요.",
                message: '"탈퇴하겠습니다"를 정확히 입력해주세요.'
            })
            return
        }

        // 탈퇴 사유 입력
        const withdrawalReason = window.prompt("탈퇴 사유를 입력해주세요.")
        // 취소한 경우
        if (withdrawalReason === null) { return }
        // 탈퇴 사유 공백 검사
        if (!withdrawalReason.trim()) {
            showAlert({ type: "warning", title: "탈퇴 사유를 입력해주세요." })
            return
        }

        // 최종 확인
        showAlert({
            type: "danger",
            title: "정말 회원 탈퇴하시겠습니까?",
            message: "회원 탈퇴 후 공부 기록, 과목, Todo 데이터는 복구할 수 없습니다.",
            showCancel: true,
            confirmText: "탈퇴",
            onConfirm: () => executeWithdraw(confirmationText, withdrawalReason)
        })
    }

    function closePasswordModal() {
        if (isPasswordSubmitting) return

        setIsPasswordModalOpen(false)
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            newPasswordConfirm: ""
        })
    }

    function handlePasswordChange(event) {
        const { name, value } = event.target

        setPasswordForm((previous) => ({
            ...previous,
            [name]: value
        }))
    }

    async function handlePasswordSubmit(event) {
        event.preventDefault()

        const { currentPassword, newPassword, newPasswordConfirm } = passwordForm

        if (!currentPassword) {
            showAlert({ type: "warning", title: "현재 비밀번호를 입력해주세요." })
            return
        }

        if (newPassword.length < 8) {
            showAlert({ type: "warning", title: "새 비밀번호는 8자 이상이어야 합니다." })
            return
        }

        if (newPassword !== newPasswordConfirm) {
            showAlert({ type: "warning", title: "새 비밀번호가 일치하지 않습니다." })
            return
        }

        if (currentPassword === newPassword) {
            showAlert({ type: "warning", title: "새 비밀번호를 다르게 설정해주세요." })
            return
        }

        try {
            setIsPasswordSubmitting(true)

            const data = await updatePassword(
                currentPassword,
                newPassword,
                newPasswordConfirm
            )

            setIsPasswordModalOpen(false)
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                newPasswordConfirm: ""
            })
            showAlert({
                type: "success",
                title: "비밀번호 변경 완료",
                message: data.message
            })
        } catch (error) {
            showAlert({
                type: "danger",
                title: "비밀번호 변경 실패",
                message: error.message
            })
        } finally {
            setIsPasswordSubmitting(false)
        }
    }

    return (
        <>
        <section className={`commonSection ${styles.userInfo}`}>
            <div className={styles.userInfoHeader}>
                <div className={styles.headerTitleArea}>
                    <div className={styles.headerIcon}>
                        <RiAccountCircle2Fill size={22} />
                    </div>

                    <div>
                        <h2>내 정보 수정</h2>
                        <p>내 정보를 관리하고 수정할 수 있습니다.</p>
                    </div>
                </div>
            </div>

            <div className={styles.profileImageSection}>
                <div className={styles.profileImageBox}>
                    <img
                        src={profileImageUrl}
                        alt={`${user.nickname || "사용자"} 프로필`}
                        className={styles.profileImage}
                        onError={(event) => {
                            event.currentTarget.src =
                                "/images/noprofile.png"
                        }}
                    />

                    {isEditing && (
                        <button
                            type="button"
                            className={
                                styles.profileImageEditButton
                            }
                            onClick={handleImageEditClick}
                            aria-label="프로필 이미지 변경"
                        >
                            <PiPencilSimpleDuotone />
                        </button>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                />
            </div>

            <div className={styles.profileForm}>
                <label htmlFor="nickname">
                    닉네임
                </label>

                <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    value={user.nickname ?? ""}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={`app-input ${
                        isEditing ? styles.editingInput : styles.readOnlyInput
                    }`}
                />

                <label htmlFor="email">
                    이메일
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    value={user.email ?? ""}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={`app-input ${
                        isEditing ? styles.editingInput : styles.readOnlyInput
                    }`}
                />
            </div>

            <div className={styles.profileButtonArea}>
                <div className={styles.accountButtons}>
                    <button
                        type="button"
                        className="app-btn-danger-outline"
                        onClick={handleWithdraw}
                    >
                        회원 탈퇴하기
                    </button>

                    {user.authProvider === "local" && (
                        <button
                            type="button"
                            className="app-btn-secondary"
                            onClick={() => setIsPasswordModalOpen(true)}
                        >
                            비밀번호 변경
                        </button>
                    )}
                </div>

                <div className={styles.profileEditButtons}>
                    {isEditing && (
                        <button
                            type="button"
                            className="app-btn-secondary"
                            onClick={handleCancel}
                        >
                            취소
                        </button>
                    )}

                    <button
                        type="button"
                        className="app-btn-primary"
                        onClick={handleEdit}
                    >
                        {isEditing ? "수정 완료" : "수정하기"}
                    </button>
                </div>
            </div>
        </section>

        <AppModal
            open={isPasswordModalOpen}
            title="비밀번호 변경"
            description="현재 비밀번호를 확인한 후 새 비밀번호로 변경합니다."
            icon={<FiLock />}
            onClose={closePasswordModal}
            closeOnOverlay={!isPasswordSubmitting}
            footer={(
                <div className={styles.passwordModalActions}>
                    <button
                        type="button"
                        className="app-btn-secondary"
                        onClick={closePasswordModal}
                        disabled={isPasswordSubmitting}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        form="password-change-form"
                        className="app-btn-primary"
                        disabled={isPasswordSubmitting}
                    >
                        {isPasswordSubmitting ? "변경 중..." : "변경하기"}
                    </button>
                </div>
            )}
        >
            <form
                id="password-change-form"
                className={styles.passwordForm}
                onSubmit={handlePasswordSubmit}
            >
                <label htmlFor="currentPassword">현재 비밀번호</label>
                <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    className="app-input"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    disabled={isPasswordSubmitting}
                    autoFocus
                />

                <label htmlFor="newPassword">새 비밀번호</label>
                <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className="app-input"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={8}
                    disabled={isPasswordSubmitting}
                />
                <p className={styles.passwordGuide}>8자 이상 입력해주세요.</p>

                <label htmlFor="newPasswordConfirm">새 비밀번호 확인</label>
                <input
                    id="newPasswordConfirm"
                    name="newPasswordConfirm"
                    type="password"
                    className="app-input"
                    value={passwordForm.newPasswordConfirm}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={8}
                    disabled={isPasswordSubmitting}
                />
            </form>
        </AppModal>

        {/* 공통 AppAlert */}
        <AppAlert
            open={alertConfig.open}
            type={alertConfig.type}
            title={alertConfig.title}
            message={alertConfig.message}
            showCancel={alertConfig.showCancel}
            confirmText={alertConfig.confirmText}
            onCancel={closeAlert}
            onClose={closeAlert}
            onConfirm={() => {
                if (alertConfig.onConfirm) {
                    alertConfig.onConfirm()
                    return
                }
                closeAlert()
            }}
        />
        </>
    )
}
