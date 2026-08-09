import { getProfileImageUrl } from "../../../../util/profileImage.js"

import styles from "./UsersTable.module.css" 

export default function UsersTable({ users, activeUserIds, onSelectUser }) {
    if (!users.length) {
        return <div className={`commonSection ${styles.usersTableMessage}`}>조건에 맞는 회원이 없습니다.</div>
    }

    return (
        <div className={`commonSection ${styles.usersTableWrapper}`}>
            <table className={styles.usersTable}>
                <thead>
                    <tr>
                        <th></th>
                        <th>닉네임</th>
                        <th>이번주 총 공부시간</th>
                        <th>현재 연속 학습일</th>
                        <th>최대 연속 학습일</th>
                        <th>개인 목표 달성률</th>
                        <th>소속 그룹</th>
                        <th>그룹 목표 달성률</th>
                        <th>상태</th>
                        <th>가입일</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        const isStudying = activeUserIds.has(user._id)
                        const achievementRate = Number(user.achievementRate ?? 0)
                        const progressRate = Math.min(Math.max(achievementRate, 0), 100)
                    
                        return (
                            <tr key={user._id} className={styles.usersTableRow} onClick={() => onSelectUser(user)}>
                                <td>
                                    <img
                                        src={getProfileImageUrl(user.profileImg)}
                                        alt={`${user.nickname} 프로필`}
                                        className={styles.usersTableAvatar}
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/noprofile.png"
                                        }}
                                    />
                                </td>
                                <td>
                                    <strong>{user.nickname}</strong>
                                </td>
                                <td>{Math.floor((user.weeklyStudyTime || 0) / 3600)}시간</td>
                                <td>{user.currentStreak}일째</td>
                                <td>{user.maxStreak}일</td>
                                <td>
                                    <div className={styles.goalRateCell}>
                                        <span className={styles.goalRateText}>{achievementRate}%</span>
                                        <div className={styles.goalRateTrack}>
                                            <div
                                                className={styles.goalRateBar}
                                                style={{ width: `${progressRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>{user.group ? user.group.groupName : "탈퇴"}</td>
                                <td>
                                    {user.groupAchievementRate !== null ? (
                                        <div className={styles.goalRateCell}>
                                            <span className={styles.goalRateText}>{user.groupAchievementRate}%</span>
                                            <div className={styles.goalRateTrack}>
                                                <div
                                                    className={styles.goalRateBar}
                                                    style={{ width: `${Math.min(Math.max(user.groupAchievementRate, 0), 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        "-"
                                    )}  
                                </td>
                                <td>
                                    <span className={isStudying ? styles.statusStudying : styles.statusResting}>
                                        ● {isStudying ? "공부중" : "휴식중"}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString("ko-KR")}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}