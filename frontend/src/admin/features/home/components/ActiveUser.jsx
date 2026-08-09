import { getProfileImageUrl } from "../../../../util/profileImage.js"
import styles from "./ActiveUser.module.css"

export default function RecentUser({ activeUsers }) {
    return (
        <section className={`commonSection ${styles.adminListCard}`}>
            <div className={styles.adminListCardHeader}>
                <div>
                    <h2>공부중인 사용자</h2>
                    <p>현재 실시간으로 학습 중인 사용자입니다.</p>
                </div>
                <span className="app-chip">{activeUsers.length}명</span>
            </div>

            <ul className={`${styles.adminActiveUserList} app-scroll`}>
                {activeUsers.length === 0 ? (
                    <li className="app-empty">현재 공부 중인 사용자가 없습니다.</li>
                ) : activeUsers.map((user) => (
                    <li key={user.userId} className={styles.adminActiveUserItem}>
                        <img
                            src={getProfileImageUrl(user.profileImg)}
                            alt={`${user.userName || "사용자"} 프로필`}
                            className={styles.adminActiveUserAvatar}
                            onError={(event) => {
                                event.currentTarget.onerror = null
                                event.currentTarget.src = "/images/noprofile.png"
                            }}
                        />
                        <div className={styles.adminActiveUserInfo}>
                            <strong>{user.userName || user.nickname}</strong>
                            <span>{user.subjectName} 과목 공부 중</span>
                        </div>
                        <span
                            className={styles.adminGroupBadge}
                            style={{ backgroundColor: user.groupColor || "#999999" }}
                        >
                            {user.groupName}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    )
}