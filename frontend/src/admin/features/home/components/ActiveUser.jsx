import { getProfileImageUrl } from "../../../../util/profileImage.js"

export default function RecentUser({ activeUsers }) {
    return (
        <div>
            <h2>접속중 유저 리스트</h2>
            <ul>
                {activeUsers.map(user => {
                    const imgSrc = getProfileImageUrl(user.profileImg);

                    return (
                        <li key={user.userId}>
                            <img src={imgSrc} alt="프로필" width="30" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                            
                            <span style={{ marginLeft: '10px' }}>{user.userName}</span>
                            
                            <span style={{ backgroundColor: user.groupColor || '#ccc', color: '#fff', marginLeft: '10px', padding: '2px 5px', borderRadius: '5px', fontSize: '12px' }}>
                                {user.groupName}
                            </span>
                            
                            <span style={{ marginLeft: '10px' }}>
                                {user.subjectName} 과목 공부 중입니다.
                            </span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}