import { Navigate } from "react-router-dom"

export default function AdminRootRedirect() {
    const role = localStorage.getItem("role")

    return role === "admin"
        ? <Navigate to="/admin/home" replace />
        : <Navigate to="/unauthorized" replace/>
}