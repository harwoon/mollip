import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiLogOut } from "react-icons/fi"
import { socket } from "../../util/socket"
import { googleLogout } from "@react-oauth/google"

import AppAlert from "./common/AppAlert.jsx"

export default function SidebarLogout({ userInfo, isRunning, onStopAndSave }) {
    const navigate = useNavigate()

    // 로그아웃 확인/오류 공통 Alert 상태
    const [alertConfig, setAlertConfig] = useState({
        open: false,
        type: "warning",
        title: "",
        message: "",
        showCancel: false,
        confirmText: "확인",
        onConfirm: null,
    })

    // Alert 닫기 공통 함수
    const closeAlert = () => {
        setAlertConfig((previous) => ({
            ...previous,
            open: false,
            onConfirm: null,
        }))
    }

    const completeLogout = () => {
        if (userInfo && userInfo.groupId && userInfo._id) {
            socket.emit("stopStudy", {
                groupId: userInfo.groupId,
                userId: userInfo._id
            })
        }

        googleLogout()
        localStorage.clear()
        navigate("/", { replace: true })
    }

    const performLogout = async () => {
        closeAlert()

        if (isRunning && typeof onStopAndSave === "function") {
            try {
                await onStopAndSave()
            } catch (error) {
                setAlertConfig({
                    open: true,
                    type: "danger",
                    title: "공부 기록 저장 실패",
                    message: `서버 저장 중 에러가 발생했습니다.\n${error.message || "잠시 후 다시 시도해주세요."}`,
                    showCancel: false,
                    confirmText: "확인",
                    onConfirm: completeLogout,
                })
                return
            }
        }

        completeLogout()
    }

    // 공통 AppAlert 표시
    const handleLogout = () => {
        setAlertConfig({
            open: true,
            type: "warning",
            title: "로그아웃 하시겠습니까?",
            message: "진행 중인 학습 상태를 확인한 후 로그아웃합니다.",
            showCancel: true,
            confirmText: "로그아웃",
            onConfirm: performLogout,
        })
    }


    return (
        <>
        <button
            type="button"
            className="sidebarLogoutButton"
            onClick={handleLogout}
        >
            <FiLogOut className="sidebarNavigationIcon" />
            로그아웃
        </button>

            {/* 공통 Alert */}
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