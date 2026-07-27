import { NavLink } from "react-router-dom"

import SidebarUserInfo from "./SidebarUserInfo"
import SidebarStudyStreak from "./SidebarStudyStreak"

import "./Sidebar.css"

export default function Sidebar() {
  const activeStyle = ({ isActive }) => {
    return {
      textDecoration: "none",
      fontWeight: isActive ? "bold" : "normal",
      color: isActive ? "#007bff" : "#333",
      padding: "10px",
      borderRadius: "8px",
      backgroundColor: isActive ? "#e9ecef" : "transparent",
      display: "block",
    };
  };

  return (
    <aside style={{ 
      width: "250px", 
      height: "100%", 
      backgroundColor: "#f8f9fa", 
      padding: "20px",
      borderRight: "1px solid #ddd"
    }}>

      <div style={{ marginBottom: "40px", fontSize: "24px", fontWeight: "bold" }}>
        Mollip
      </div>

      <SidebarUserInfo />

      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        <NavLink to="/home" style={activeStyle}>
          홈
        </NavLink>
        
        <NavLink to="/records" style={activeStyle}>
          기록
        </NavLink>
        
        <NavLink to="/weekly" style={activeStyle}>
          주간 현황
        </NavLink>
        
      </nav>

      <SidebarStudyStreak />
    </aside>
  )
}