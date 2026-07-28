import { Outlet } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"

export default function AdminMainLayout() {
    return (
        <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
            <AdminSidebar/>
            <main style={{ flex: 1, backgroundColor: "#F8F8FC", overflow: "auto" }}>
                관리자 홈 페이지 레이아웃
                <Outlet/>
            </main>
        </div>
    )
}