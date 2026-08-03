import { NavLink } from "react-router-dom"

import SidebarUserInfo from "./SidebarUserInfo"
import SidebarStudyStreak from "./SidebarStudyStreak"
import SidebarLogout from "./SidebarLogout"

import "./Sidebar.css"
import { FiBarChart2, FiBookOpen, FiHome, FiSettings, FiUsers } from "react-icons/fi"

const DEFAULT_GROUP_ID = "6a671438ab632542fc161df7"

export default function Sidebar({ selectedSubject, time, isRunning }) {
    const getNavClassName = ({ isActive }) => {
        return isActive 
            ? "sidebarNavigationLink sidebarNavigationLinkActive" 
            : "sidebarNavigationLink"
    }

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

                        {/* 6a671438ab632542fc161df7 - 그룹 휴먼 id */}
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

                {/* 타이머 UI 박스 */}
                {isRunning && selectedSubject && (
                    <div className="sidebarTimer">
                        <p className="sidebarTimerSubject">
                            <span aria-hidden="true">🔥</span>
                            {selectedSubject.subjectName} 공부 중
                        </p>

                        <strong className="sidebarTimerTime">
                            {formatMiniTime(time)}
                        </strong>
                    </div>
                )}
            </div>

            <div className="sidebarBottom">
                <div className="sidebarStreak">
                    <SidebarStudyStreak />
                </div>

                <div className="sidebarLogout">
                    <SidebarLogout />
                </div>
            </div>
        </aside>
    )
}

const formatMiniTime = (currentTime) => {
        const hours = Math.floor(currentTime / 360000)
        const minutes = Math.floor((currentTime % 360000) / 6000)
        const seconds = Math.floor((currentTime % 6000) / 100)
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}