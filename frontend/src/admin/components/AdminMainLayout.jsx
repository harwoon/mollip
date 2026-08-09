import { Outlet } from "react-router-dom"
import AdminSidebar from "./AdminSidebar.jsx"
import styles from "./AdminLayout.module.css"

export default function AdminMainLayout() {
    return (
        <div className={`app-shell ${styles.adminShell}`}>
            <AdminSidebar />

            <main className={`app-main ${styles.adminMain}`}>
                <Outlet />
            </main>
        </div>
    )
}