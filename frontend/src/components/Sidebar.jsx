import { NavLink } from "react-router-dom"

import SidebarUserInfo from "./SidebarUserInfo"
import SidebarStudyStreak from "./SidebarStudyStreak"
import SidebarLogout from "./SidebarLogout"

import "./Sidebar.css"

const DEFAULT_GROUP_ID = "6a671438ab632542fc161df7"

export default function Sidebar({ selectedSubject, time, isRunning }) {
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

  const handleGroupClick = (e) => {
    // 클릭하는 현재 시점의 groupId를 가져옴
    const groupId = localStorage.getItem("groupId")

    if (!groupId || groupId === DEFAULT_GROUP_ID) {
      // /group 페이지로 이동하는 기본 동작 중지
      e.preventDefault()

      alert(
        `현재 그룹이 정해지지 않았습니다. 
그룹 배정을 위해서는 총 공부시간 1시간 이상을 달성해야 합니다. 
그룹은 매주 월요일에 주간 공부시간이 초기화되면서 새롭게 배정됩니다.`,
      )
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
      <SidebarUserInfo />

      <nav className="sidebarNavigation">

        <NavLink to="/home" style={activeStyle}>
          홈
        </NavLink>

        <NavLink to="/records" style={activeStyle}>
          기록
        </NavLink>

        <NavLink to="/weekly" style={activeStyle}>
          주간 현황
        </NavLink>
        {/* 6a671438ab632542fc161df7 - 그룹 휴먼 id */}
        <NavLink to="/group" style={activeStyle} onClick={handleGroupClick}>
          그룹
        </NavLink>

        <NavLink to="/mypage" style={activeStyle}>
          마이페이지
        </NavLink>

        {/* 타이머 UI 박스 */}
        {selectedSubject && (
            <div style={{
                margin: "15px 0",
                padding: "12px",
                backgroundColor: "#f3e8ff",
                borderRadius: "12px",
                border: "1px solid #d8b4fe",
                textAlign: "center"
            }}>
                <div style={{ fontSize: "0.85rem", color: "#6b21a8", fontWeight: "bold", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🔥 {selectedSubject.subjectName} 공부 중
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#7e22ce", letterSpacing: "1px" }}>
                    {formatMiniTime(time)}
                </div>
            </div>
        )}

      </nav>

      <SidebarStudyStreak />

      <SidebarLogout />

    </aside >
  )
}

const formatMiniTime = (currentTime) => {
    const hours = Math.floor(currentTime / 360000)
    const minutes = Math.floor((currentTime % 360000) / 6000)
    const seconds = Math.floor((currentTime % 6000) / 100)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}