import { NavLink } from "react-router-dom"
import {FiBarChart2, FiBookOpen, FiHome, FiMail} from "react-icons/fi"
import "../../components/Sidebar.css"
import SidebarUserInfo from "../../components/SidebarUserInfo.jsx"
import SidebarLogout from "../../components/SidebarLogout.jsx"
import AdminMemberStatusModal from "./AdminMemberStatusModal.jsx"
import { useState } from "react"

export default function AdminSidebar() {
    // 관리회원현황 모달 열림 여부
    const [
        isMemberStatusOpen,
        setIsMemberStatusOpen
    ] = useState(false)

    // 현재 주소와 NavLink의 주소가 일치하면
    // sidebarNavigationLinkActive 클래스를 함께 적용
    const getNavClassName = ({ isActive }) => {
        return isActive
            ? "sidebarNavigationLink sidebarNavigationLinkActive"
            : "sidebarNavigationLink"
    }

    return (
        <>
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
                        <NavLink to="/admin/home" className={getNavClassName}>
                            <FiHome className="sidebarNavigationIcon"/>
                            <span>대시보드</span>
                        </NavLink>

                        <NavLink to="/admin/users" className={getNavClassName}>
                            <FiBookOpen className="sidebarNavigationIcon"/>
                            <span>회원 현황</span>
                        </NavLink>

                        <NavLink to="/admin/groups" className={getNavClassName}>
                            <FiBarChart2 className="sidebarNavigationIcon"/>
                            <span>그룹 현황</span>
                        </NavLink>

                        {/* 관리회원현황 모달 열기 */}
                        <button
                            type="button"
                            className="sidebarNavigationLink adminMemberStatusSidebarButton"
                            onClick={() => setIsMemberStatusOpen(true)}
                        >
                            <FiMail className="sidebarNavigationIcon"/>

                            <span>관리회원현황</span>
                        </button>
                    </div>
                </nav>
            </div>
            <SidebarLogout />
        </aside>
        {/* 관리회원현황 모달 */}
        {isMemberStatusOpen && (
            <AdminMemberStatusModal
                onClose={() =>
                    setIsMemberStatusOpen(
                        false
                    )
                }
            />
        )}
        </>
    )
}