import { useNavigate } from "react-router-dom"
import { FiLogOut } from "react-icons/fi"
import { socket } from "../../util/socket"
import { googleLogout } from "@react-oauth/google"

export default function SidebarLogout({ userInfo }) {
    const navigate = useNavigate()

    const handleLogout = () => {

        const isLogout = window.confirm("로그아웃 하시겠습니까?")

        if (!isLogout) return

        if (userInfo && userInfo.groupId && userInfo._id) {
            socket.emit("stopStudy", {
                groupId: userInfo.groupId,
                userId: userInfo._id
            })
        }

        googleLogout()

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