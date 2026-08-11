import { createRoot } from "react-dom/client"
import { GoogleOAuthProvider } from "@react-oauth/google"

import "./index.css"
import App from "./App.jsx"
import { installAuthSessionMonitor } from "./features/auth/authSessionMonitor.js"

const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!googleClientId) {
    throw new Error(
        "VITE_GOOGLE_CLIENT_ID가 없습니다.",
    )
}

installAuthSessionMonitor()

createRoot(
    document.getElementById("root"),
).render(
    <GoogleOAuthProvider
        clientId={googleClientId}
    >
        <App />
    </GoogleOAuthProvider>,
)
