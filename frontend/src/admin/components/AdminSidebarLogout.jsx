import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiLogOut } from "react-icons/fi"

import AppAlert from "../../components/common/AppAlert.jsx"
import styles from "./AdminSidebarLogout.module.css"

export default function AdminSidebarLogout() {
    const navigate = useNavigate()
    const [logoutAlertOpen, setLogoutAlertOpen] = useState(false)

    const handleLogoutConfirm = () => {
        setLogoutAlertOpen(false)

        localStorage.removeItem("token")
        localStorage.removeItem("userInfo")
        localStorage.removeItem("userId")
        localStorage.removeItem("groupId")

        navigate("/login", {
            replace: true,
        })
    }

    const handleLogoutClick = () => {
        setLogoutAlertOpen(true)
    }

    return (
        <>
            <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogoutClick}
            >
                <FiLogOut className={styles.icon} />
                <span>로그아웃</span>
            </button>

            <AppAlert
                open={logoutAlertOpen}
                type="warning"
                title="로그아웃하시겠습니까?"
                message="현재 관리자 계정에서 로그아웃합니다."
                showCancel={true}
                confirmText="로그아웃"
                onCancel={() => setLogoutAlertOpen(false)}
                onClose={() => setLogoutAlertOpen(false)}
                onConfirm={handleLogoutConfirm}
            />
        </>
    )
}