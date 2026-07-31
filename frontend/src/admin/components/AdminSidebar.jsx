import { NavLink } from "react-router-dom"

import "../../components/Sidebar.css"
import SidebarUserInfo from "../../components/SidebarUserInfo.jsx"

export default function AdminSidebar() {
    const activeStyle = ({ isActive }) => {
        return {
        textDecoration: "none",
        fontWeight: isActive ? "bold" : "normal",
        color: isActive ? "#7c5cc4" : "#333",
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: isActive ? "#e9ecef" : "transparent",
        display: "block",
        }
    }

    return (
        <aside style={{ 
        width: "250px", 
        height: "100%", 
        backgroundColor: "#f8f9fa", 
        padding: "20px",
        borderRight: "1px solid #ddd"
        }}>
            <div className="sidebarLogo">
                <img src="/images/logo.png" alt="Mollip" />
            </div>
            <SidebarUserInfo /> {/* 확인하기 */}

            <nav className="sidebarNavigation">
                <p>DASHBOARD</p>
                <NavLink to="/admin/home" style={activeStyle}>
                    홈
                </NavLink>

                <NavLink to="/admin/users" style={activeStyle}>
                    회원 조회
                </NavLink>

                <NavLink to="/admin/groups" style={activeStyle}>
                    그룹 관리
                </NavLink>
            </nav>
            
        </aside>
    )
}