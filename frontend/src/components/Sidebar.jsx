import { useState, memo } from "react"
import { NavLink } from "react-router-dom"

import SidebarUserInfo from "./SidebarUserInfo"
import SidebarStudyStreak from "./SidebarStudyStreak"
import SidebarLogout from "./SidebarLogout"
import AiReportModal from "./AiReportModal.jsx"
import SidebarTimer from "./SidebarTimer.jsx"

import "./Sidebar.css"
import { FiBarChart2, FiBookOpen, FiHome, FiSettings, FiUsers } from "react-icons/fi"
import { RiSparklingFill } from "react-icons/ri"

const DEFAULT_GROUP_ID = "6a671438ab632542fc161df7"

function Sidebar({ 
    userInfo,
    todayTodos = [],
    onAddTodo,
    onRemoveTodo
}) {
    const [isReportOpen, setIsReportOpen] = useState(false)
    
    const getNavClassName = ({ isActive }) => {
        return isActive 
            ? "sidebarNavigationLink sidebarNavigationLinkActive" 
            : "sidebarNavigationLink"
    }

    const handleGroupClick = (e) => {
        const groupId = localStorage.getItem("groupId")

        if (!groupId || groupId === DEFAULT_GROUP_ID) {
            e.preventDefault()
            alert(
                `현재 그룹이 정해지지 않았습니다. 
                그룹 배정을 위해서는 총 공부시간 1시간 이상을 달성해야 합니다. 
                그룹은 매주 월요일에 주간 공부시간이 초기화되면서 새롭게 배정됩니다.`,
            )
        }
    }

    return (
        <aside className="sidebar">
            <div className="sidebarTop">
                <div className="sidebarLogo">
                    <img src="/images/logo.png" alt="Mollip"/>
                </div>

                <div className="sidebarUser">
                    <SidebarUserInfo />
                </div>

                <nav className="sidebarNavigation">
                    <div className="sidebarNavigationGroup">
                        <p className="sidebarNavigationTitle">DASHBOARD</p>

                        <NavLink to="/home" className={getNavClassName}>
                            <FiHome className="sidebarNavigationIcon" />
                            <span>홈</span>
                        </NavLink>

                        <NavLink to="/records" className={getNavClassName}>
                            <FiBookOpen className="sidebarNavigationIcon" />
                            <span>기록</span>
                        </NavLink>

                        <NavLink to="/weekly" className={getNavClassName}>
                            <FiBarChart2 className="sidebarNavigationIcon" />
                            <span>주간 현황</span>
                        </NavLink>
                    </div>

                    <div className="sidebarNavigationGroup">
                        <p className="sidebarNavigationTitle">COMMUNICATION</p>

                        <NavLink to="/group" className={getNavClassName} onClick={handleGroupClick}>
                            <FiUsers className="sidebarNavigationIcon" />
                            <span>그룹</span>
                        </NavLink>
                    </div>

                    <div className="sidebarNavigationGroup">
                        <p className="sidebarNavigationTitle">SETTINGS</p>

                        <NavLink to="/mypage" className={getNavClassName}>
                            <FiSettings className="sidebarNavigationIcon" />
                            <span>마이페이지</span>
                        </NavLink>
                    </div>
                </nav>
            </div>

            <div className="sidebarBottom">
                <SidebarTimer />

                <div className="sidebarStreak">
                    <SidebarStudyStreak />
                </div>

                <button type="button" onClick={() => setIsReportOpen(true)} className="sidebarAI">
                    <RiSparklingFill className="sidebarNavigationIcon" />
                    <span>AI 학습 리포트</span>
                </button>

                <div className="sidebarLogout">
                    <SidebarLogout userInfo={userInfo} />
                </div>
            </div>

            {isReportOpen && (
                <AiReportModal
                    onClose={() => setIsReportOpen(false)}
                    todayTodos={todayTodos}
                    onAddTodo={onAddTodo}
                    onRemoveTodo={onRemoveTodo}
                />
            )}
        </aside>
    )
}

export default memo(Sidebar)