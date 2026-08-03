import "./UsersTable.css"

const API_URL = import.meta.env.VITE_LOCAL_API_URL

function getProfileImageUrl(profileImg) {
    return profileImg
        ? `${API_URL}${profileImg}`
        : "/images/noprofile.png"
}

export default function UsersTable({ users, activeUserIds }) {
    if (!users.length) {
        return <div className="usersTableMessage">조건에 맞는 회원이 없습니다.</div>
    }

    return (
        <div className="usersTableWrapper">
            <table className="usersTable">
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
                            <tr key={user._id} className="usersTableRow">
                                <td>
                                    <img
                                        src={getProfileImageUrl(user.profileImg)}
                                        alt={`${user.nickname} 프로필`}
                                        className="usersTableAvatar"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/noprofile.png"
                                        }}
                                    />
                                </td>
                                <td>
                                    <strong>{user.nickname}</strong>
                                </td>
                                <td>{Math.floor((user.weeklyStudyTime || 0) / 60)}시간</td>
                                <td>{user.currentStreak}일째</td>
                                <td>{user.maxStreak}일</td>
                                <td>
                                    <div className="goalRateCell">
                                        <span className="goalRateText">{achievementRate}%</span>
                                        <div className="goalRateTrack">
                                            <div
                                                className="goalRateBar"
                                                style={{ width: `${progressRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>{user.group ? user.group.groupName : "탈퇴"}</td>
                                <td>
                                    {user.groupAchievementRate !== null ? (
                                        <div className="goalRateCell">
                                            <span className="goalRateText">{user.groupAchievementRate}%</span>
                                            <div className="goalRateTrack">
                                                <div
                                                    className="goalRateBar"
                                                    style={{ width: `${Math.min(Math.max(user.groupAchievementRate, 0), 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        "-"
                                    )}  
                                </td>
                                <td>
                                    <span className={isStudying ? "statusStudying" : "statusResting"}>
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