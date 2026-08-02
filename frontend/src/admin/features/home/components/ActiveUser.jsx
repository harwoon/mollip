const API_URL = import.meta.env.VITE_LOCAL_API_URL

export default function RecentUser({activeUsers}) {
    return (
        <div>
            <h2>접속중 유저 리스트</h2>
            <ul>
                {activeUsers.map(user => (
                    <li key={user.userId}>
                        <img src={`${API_URL}${user.profileImg}`} alt="프로필" width="30" />
                        <span>{user.userName}</span>
                        <span style={{ backgroundColor: user.groupColor || '#ccc', color: '#fff', marginLeft: '10px', padding: '2px 5px', borderRadius: '5px', fontSize: '12px' }}>
                            {user.groupName}
                        </span>
                        <span style={{ marginLeft: '10px' }}>
                            {user.subjectName} 과목 공부 중입니다.
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}