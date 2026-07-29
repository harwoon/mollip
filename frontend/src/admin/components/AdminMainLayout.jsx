import { Outlet } from "react-router-dom"
import AdminSidebar from "./AdminSidebar.jsx"

export default function AdminMainLayout() {
    return (
        <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
            <AdminSidebar/>
            <main style={{ flex: 1, backgroundColor: "#F8F8FC", overflow: "auto" }}>
                <Outlet/>
            </main>
        </div>
    )
}