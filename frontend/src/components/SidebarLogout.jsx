import { useNavigate } from "react-router-dom"

export default function SidebarLogout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")

    navigate("/", {
      replace: true
    })
  }

  return (
    <button
      type="button"
      className="sidebarLogoutButton"
      onClick={handleLogout}
    >
      로그아웃
    </button>
  )
}