import { API_URL } from "../../../config/apiUrl.js"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getMyInfo } from "../../auth/api/auth"
import { PiPencilSimpleDuotone } from "react-icons/pi"
import { RiAccountCircle2Fill } from "react-icons/ri"

import { updateMyInfo, updateProfileImage, withdrawMyAccount } from "../api/mypage"

import styles from "./UserInfo.module.css"

export default function UserInfo() {
    // 회원 탈퇴 후 로그인 페이지 이동
    const navigate = useNavigate()

    // 프로필 표시할 사용자 정보
    const [user, setUser] = useState({
        nickname: "",
        email: "",
        profileImg: ""
    })

    // 수정취소, 실패 시 원래 값 되돌리기위한 정보
    const [originalUser, setOriginalUser] = useState({
        nickname: "",
        email: "",
        profileImg: ""
    })

    // 현재 수정모드인지 확인: 기본값 false
    const [isEditing, setIsEditing] = useState(false)

    // 숨겨진 파일 input에 접근
    const fileInputRef = useRef(null)

    // 서버로 전송할 실제 이미지 파일
    const [selectedImageFile, setSelectedImageFile] = useState(null)

    // 사용자가 선택한 이미지의 미리보기 주소
    const [previewImageUrl, setPreviewImageUrl] = useState("")

    useEffect(() => {
        async function loadMyInfo() {
            try {
                const data = await getMyInfo()

                const userInfo = {
                    nickname: data.user.nickname ?? "",
                    email: data.user.email ?? "",
                    profileImg: data.user.profileImg ?? ""
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
    // 백엔드 서버 주소를 앞에 붙여 실제 이미지 주소 생성
    const savedProfileImageUrl = user.profileImg
        ? `${API_URL}${user.profileImg}`
        : "/images/noprofile.png"

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
            alert("이미지 파일만 선택할 수 있습니다.")
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
            alert("닉네임을 입력해주세요.")
            return
        }
        if (!user.email.trim()) {
            alert("이메일을 입력해주세요.")
            return
        }

        // 변경사항 있는지 확인 (닉네임/이메일/이미지 중 하나라도 바뀌었는지 확인)
        const isNicknameChanged = user.nickname.trim() !== originalUser.nickname
        const isEmailChanged = user.email.trim() !== originalUser.email
        const isProfileImgChanged = !!selectedImageFile

        if (!isNicknameChanged && !isEmailChanged && !isProfileImgChanged) {
            alert("수정된 내용이 없습니다.")
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
                profileImg: updatedProfileImg ?? ""
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
            alert(infoData.message || "회원정보가 수정되었습니다!")

        } catch (error) {
            console.error(
                "회원정보 수정 오류:",
                error
            )

            alert(
                error.message ||
                "회원정보 수정에 실패했습니다."
            )
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

    // 회원 탈퇴
    async function handleWithdraw() {
        console.log("버튼클릭")
        // 탈퇴 확인 문구 입력
        const confirmationText = window.prompt('"탈퇴하겠습니다"를 입력해주세요.')
        // 취소한 경우
        if (confirmationText === null) { return }
        // 확인 문구 검사
        if (confirmationText !== "탈퇴하겠습니다") {
            alert('"탈퇴하겠습니다"를 정확히 입력해주세요.')
            return
        }

        // 탈퇴 사유 입력
        const withdrawalReason = window.prompt("탈퇴 사유를 입력해주세요.")
        // 취소한 경우
        if (withdrawalReason === null) { return }
        // 탈퇴 사유 공백 검사
        if (!withdrawalReason.trim()) {
            alert("탈퇴 사유를 입력해주세요.")
            return
        }

        // 최종 확인
        const isConfirmed = window.confirm(
            "회원 탈퇴 후 공부 기록, 과목, Todo 데이터는 복구할 수 없습니다.\n정말 탈퇴하시겠습니까?"
        )

        if (!isConfirmed) {
            return
        }

        try {
            // 회원 탈퇴 API 요청
            const data = await withdrawMyAccount(
                confirmationText,
                withdrawalReason.trim()
            )

            // 로그인 및 사용자 정보 삭제
            localStorage.removeItem("token")
            localStorage.removeItem("role")
            localStorage.removeItem("groupId")
            localStorage.removeItem("userId")
            localStorage.removeItem("user")
            alert(data.message || "회원 탈퇴가 완료되었습니다.")

            // 로그인 페이지로 이동
            navigate("/", {
                replace: true
            })

        } catch (error) {
            console.error("회원 탈퇴 오류:", error)
            alert(error.message || "회원 탈퇴에 실패했습니다.")
        }
    }

    return (
        <section className={`commonSection ${styles.userInfo}`}>
            <div className={styles.userInfoHeader}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>

                    {/* 동그란 아이콘 배경 */}
                    <div
                        style={{
                            minWidth: "42px",
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            backgroundColor: "#E2E2F6",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#8e5ab9",
                            marginTop: "2px"
                        }}
                    >
                        <RiAccountCircle2Fill size={22} />
                    </div>

                    <div>
                        <h2 style={{ margin: 0 }}>내 정보 수정</h2>
                        <p style={{ margin: "4px 0 0 0" }}>내 정보를 관리하고 수정할 수 있습니다.</p>
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
                    className={
                        isEditing
                            ? styles.editingInput
                            : styles.readOnlyInput
                    }
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
                    className={
                        isEditing
                            ? styles.editingInput
                            : styles.readOnlyInput
                    }
                />
            </div>

            <div className={styles.profileButtonArea}>
                <button
                    type="button"
                    className={styles.withdrawButton}
                    onClick={handleWithdraw}
                >
                    회원 탈퇴하기
                </button>

                <div className={styles.profileEditButtons}>
                    {isEditing && (
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={handleCancel}
                        >
                            취소
                        </button>
                    )}

                    <button
                        type="button"
                        className={styles.editButton}
                        onClick={handleEdit}
                    >
                        {isEditing ? "수정 완료" : "수정하기"}
                    </button>
                </div>
            </div>
        </section>
    )
}