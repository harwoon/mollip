import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function MainLayout() {
    return (
        <div>
            <Sidebar />
            <main>
                <Outlet />
            </main>
        </div>
    )
}