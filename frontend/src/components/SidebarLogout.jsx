import { useNavigate } from "react-router-dom"
import { FiLogOut } from "react-icons/fi"
import { socket } from "../../util/socket"

export default function SidebarLogout({ userInfo, isRunning, onStopAndSave }) {
    const navigate = useNavigate()

    const handleLogout = async () => {
        const isLogout = window.confirm("로그아웃 하시겠습니까?")
        if (!isLogout) return

        if (isRunning && typeof onStopAndSave === "function") {
            try {
                await onStopAndSave()
            } catch (error) {
                alert("서버 저장 중 에러 발생: " + error.message)
            }
        }

        if (userInfo && userInfo.groupId && userInfo._id) {
            socket.emit("stopStudy", {
                groupId: userInfo.groupId,
                userId: userInfo._id
            })
        }

        localStorage.clear()
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