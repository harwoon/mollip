import styles from "./RecentUser.module.css" 


export default function RecentUser({ logs }) {
    return (
        <section className={`commonSection ${styles.adminRecentCard}`}>
            <div className={styles.adminListCardHeader}>
                <div>
                    <h2>최근 활동</h2>
                    <p>최근 가입·탈퇴 등 주요 회원 활동입니다.</p>
                </div>
            </div>

            <ul className={`${styles.adminRecentList} app-scroll`}>

                {!logs?.length ? (
                    <li className="app-empty">최근 활동이 없습니다.</li>

                ) : logs.map((log, index) => (
                    <li key={index} className={styles.adminRecentItem}>
                        <span 
                            className={log.type === "SIGNUP" 
                                ? `${styles.adminLogBadge} ${styles.signup}` : `${styles.adminLogBadge} ${styles.withdrawal}`}>
                            {log.type === "SIGNUP" ? "가입" : "탈퇴"}
                        </span>
                        
                        <span className={styles.adminRecentMessage}>
                            {log.message}
                        </span>

                        <time>
                            {new Date(log.createdAt).toLocaleString()}
                        </time>
                    </li>
                ))}
            </ul>
        </section>
    )
}
