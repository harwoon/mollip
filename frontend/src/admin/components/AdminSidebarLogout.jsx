import { useNavigate } from "react-router-dom"
import { FiLogOut } from "react-icons/fi"

export default function SidebarLogout() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.clear()
        // setTime(0)
        // setIsRunning(false)
        // setSelectedSubject(null)

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