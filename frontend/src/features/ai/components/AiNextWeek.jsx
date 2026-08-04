// expectedChanges.label: 변화 지표명
// expectedChanges.from: 변화전
// expectedChanges.to: 변화후
// expectedChanges.trend: up 또는 down

export default function AiNextWeek({ expectedChanges = [] }) {
    if (!expectedChanges || expectedChanges.length === 0) {
        return <div>예상 변화 데이터가 없습니다</div>
    }
    
    return (
        <div>
            <h3>다음 주 예상 변화</h3>
            <ul>
                {expectedChanges.map((change, index) => (
                    <li key={index}>
                        <strong>{change.label}</strong>
                        <span> {change.from} → {change.to} </span>
                        <span>
                            {change.trend === "up" ? "(상승)" : "(하락)"}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}