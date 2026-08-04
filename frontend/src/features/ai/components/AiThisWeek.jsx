// 성욱
// recommendations.day: 요일
// recommendations.task: 추천 Todo 내용
// recommendations.duration: 소요시간
// recommendations.effect: 예상 효과
// task랑 duration만 사용

export default function AiThisWeek({ recommendations = [], onAddTodo }) {
    return (
        <section>
            <div className="aiReportHeader">
                <h3>이번주 Todo 추천</h3>
            </div>

            {recommendations.length === 0 ? (
                <p className="aiReportError">
                    추천할 Todo내용이 없습니다.
                </p>
            ) : (
                <ul>
                    {recommendations.map((recommend, index) => (
                        <li key={`${recommend.day}-${index}`}>
                            <p>
                                <span>{recommend.task}</span>
                                <span>({recommend.duration})</span>
                            </p>
                            <p>{recommend.effect}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}