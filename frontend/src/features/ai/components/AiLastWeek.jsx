// 승아
// patterns.title: 패턴 요약
// patterns.description: 상세 설명 및 조언

export default function AiLastWeek({ patterns = [] }) {
    console.log("patterns 개수:", patterns.length)
    console.log("patterns 데이터:", patterns)
    return (
        <section>
            <div className="aiReportHeader">
                <h3>지난주 학습 패턴</h3>
            </div>

            {patterns.length === 0 ? (
                <p className="aiReportError">
                    분석할 지난주 학습 데이터가 없습니다.
                </p>
            ) : (
                <ul>
                    {patterns.map((pattern, index) => (
                        <li key={`${pattern.title}-${index}`}>
                            <strong>{pattern.title}</strong>
                            <p>{pattern.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}