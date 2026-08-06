import { Navigate, Outlet } from "react-router-dom"

export default function AdminRoute() {
    const userJson = localStorage.getItem("user")
    const user = userJson ? JSON.parse(userJson) : null
    
    if (!user || user.role !== "admin") {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet/>
}