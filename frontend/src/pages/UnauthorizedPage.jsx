import { useNavigate } from "react-router-dom"

import styles from "./UnauthorizedPage.module.css"

export default function UnauthorizedPage() {
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <h1>Mollip</h1>
            <div className={styles.title}>
                <span>X</span>접근할 수 없습니다<span>X</span>
            </div>
            <p className={styles.description}>이 페이지에 접근할 권한이 없습니다.</p>
            <button className={styles.homeButton} type="button" onClick={() => navigate("/home")}>홈으로 돌아가기</button>
        </div>
    )
}