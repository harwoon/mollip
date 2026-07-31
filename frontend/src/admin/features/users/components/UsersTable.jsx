import "./UsersTable.css"

const API_URL = import.meta.env.VITE_LOCAL_API_URL

function getProfileImageUrl(profileImg) {
    return profileImg
        ? `${API_URL}${profileImg}`
        : "/images/noprofile.png"
}

function formatStudyTime(minutes) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

export default function UsersTable({ users }) {
    return (
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
                {users.length === 0 ? (
                    <tr>
                        <td colSpan={10} className="usersTableEmpty">
                            조건에 맞는 회원이 없습니다.
                        </td>
                    </tr>
                ) : (
                    users.map(user => (
                        <tr key={user._id}>
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
                            <td>{user.nickname}</td>
                            <td>{formatStudyTime(user.weeklyStudyTime || 0)}</td>
                            <td>{user.currentStreak}일째</td>
                            <td>{user.maxStreak}일</td>
                            <td>{user.achievementRate}%</td>
                            <td>{user.group ? user.group.groupName : "미배정"}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>{new Date(user.createdAt).toLocaleDateString("ko-KR")}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    )
}