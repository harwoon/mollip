import { useNavigate } from "react-router-dom"
import { FiLogOut } from "react-icons/fi"

export default function SidebarLogout() {
    const navigate = useNavigate()

    const handleLogout = () => {

        const isLogout = window.confirm("로그아웃 하시겠습니까?")

        if (!isLogout) return

        localStorage.clear()

        // 로그인 페이지로 이동
        navigate("/", { replace: true })
        
    }

    return (
        <button
            type="button"
            className="sidebarLogoutButton"
            onClick={handleLogout}
        >
            <FiLogOut className="sidebarNavigationIcon" />
            로그아웃
        </button>
    )
}