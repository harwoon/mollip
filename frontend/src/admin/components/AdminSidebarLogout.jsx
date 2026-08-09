import { useNavigate } from "react-router-dom"
import { FiLogOut } from "react-icons/fi"
import styles from "./AdminSidebarLogout.module.css"

export default function AdminSidebarLogout() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.clear()
        navigate("/", { replace: true })
    }

    return (
        <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
        >
            <FiLogOut className={styles.icon} />
            로그아웃
        </button>
    )
}