import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function MainLayout() {
    return (
        <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
            <Sidebar />
            <main style={{ flex: 1, backgroundColor: "#F8F8FC", overflow: "auto" }}>
                <Outlet />
            </main>
        </div>
    )
}