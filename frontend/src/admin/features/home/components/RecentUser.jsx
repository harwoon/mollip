const API_URL = import.meta.env.VITE_API_URL

export default function RecentUser({logs}) {
    return (
        <div>
            <h2>최근 활동</h2>
            <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid #ccc' }}>
                <ul>
                    {logs?.map((log, index) => (
                        <li key={index}>
                            <span style={{ color: log.type === 'SIGNUP' ? 'blue' : 'red' }}>
                                [{log.type === 'SIGNUP' ? '가입' : '탈퇴'}]
                            </span>
                            {' '}{log.message}
                            <span style={{ color: 'gray', fontSize: '12px', marginLeft: '10px' }}>
                                ({new Date(log.createdAt).toLocaleString()})
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
