import { useState } from "react"
import { NavLink } from "react-router-dom"
import {FiBarChart2, FiBookOpen, FiHome, FiMail} from "react-icons/fi"

import styles from "./AdminSidebar.module.css" 

import SidebarUserInfo from "../../components/SidebarUserInfo.jsx"
import AdminSidebarLogout from "./AdminSidebarLogout.jsx"
import AdminMemberStatusModal from "./AdminMemberStatusModal.jsx"


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
            ? `${styles.sidebarNavigationLink} ${styles.sidebarNavigationLinkActive}`
            : styles.sidebarNavigationLink
    }

    return (
        <>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTop}>
                    <div className={styles.sidebarLogo}>
                        <img src="/images/logo.png" alt="Mollip" />
                    </div>

                    <div className={styles.sidebarUser}>
                        <SidebarUserInfo />
                    </div>

                    <nav className={styles.sidebarNavigation}>
                        <div className={styles.sidebarNavigationGroup}>
                            <NavLink to="/admin/home" className={getNavClassName}>
                                <FiHome className={styles.sidebarNavigationIcon} />
                                <span>대시보드</span>
                            </NavLink>

                            <NavLink to="/admin/users" className={getNavClassName}>
                                <FiBookOpen className={styles.sidebarNavigationIcon} />
                                <span>회원 현황</span>
                            </NavLink>

                            <NavLink to="/admin/groups" className={getNavClassName}>
                                <FiBarChart2 className={styles.sidebarNavigationIcon} />
                                <span>그룹 현황</span>
                            </NavLink>

                            <button
                                type="button"
                                className={`${styles.sidebarNavigationLink} ${styles.adminMemberStatusSidebarButton}`}
                                onClick={() => setIsMemberStatusOpen(true)}
                            >
                                <FiMail className={styles.sidebarNavigationIcon} />
                                <span>관리회원현황</span>
                            </button>
                        </div>
                    </nav>
                </div>

                <AdminSidebarLogout />
            </aside>

            {isMemberStatusOpen && (
                <AdminMemberStatusModal
                    onClose={() => setIsMemberStatusOpen(false)}
                />
            )}
        </>
    )
}