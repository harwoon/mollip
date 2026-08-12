// 승아 - todo
// recommendations.day: 요일
// recommendations.task: 추천 Todo 내용
// recommendations.duration: 소요시간
// recommendations.effect: 예상 효과
// task랑 duration만 사용
import { useState } from "react"
import AppAlert from "../../../components/common/AppAlert.jsx"

export default function AiThisWeek({ 
    recommendations = [], 
    // 오늘 홈 Todo 목록: 다음 날에는 같은 Todo를 다시 추가할 수 있음
    todayTodos = [],
    // AI 추천 Todo 홈 추가
    onAddTodo,
    // 이미 추가된 AI 추천 Todo 홈에서 제거
    onRemoveTodo
}) {
    const [processingIndex, setProcessingIndex] = useState(null)
    const [removeTarget, setRemoveTarget] = useState(null)
    const [errorMessage, setErrorMessage] = useState("")

    // 오늘 홈 Todo에서 추천 Todo와 같은 항목 찾기
    const findTodayTodo = (task) => {
        const normalizedTask = task?.trim()

        return todayTodos.find(
            (todo) =>
                todo.todo?.trim() === normalizedTask
        )
    }

    // 오늘 홈 Todo에 추가되어 있는지 확인
    const isTodoAdded = (task) => {
        return Boolean(findTodayTodo(task))
    }

    // 홈에서 실제 완료한 Todo인지 확인
    const isTodoCompleted = (task) => {
        const matchedTodo = findTodayTodo(task)

        return matchedTodo?.state === true
    }

    // Todo 추가 버튼, 추가됨 버튼
    const handleTodoButton = async (recommend, index) => {
        const added = isTodoAdded(recommend.task)

        try {
            setProcessingIndex(index)

            // 오늘 이미 추가된 Todo = 홈에서 제거할지 확인
            if (added) {
                setRemoveTarget({ recommend, index })
                return
            }

            // 오늘 아직 추가되지 않은 Todo 홈에 추가
            if (!onAddTodo) {
                console.error("onAddTodo가 전달되지 않았습니다.")
                return
            }
            await onAddTodo(recommend.task)

        } catch (error) {
            setErrorMessage(error.message || "Todo를 처리하지 못했습니다.")
        } finally {
            setProcessingIndex(null)
        }
    }

    // 공통 확인창에서 제거 확정했을 때 기존 onRemoveTodo 실행
    const confirmRemoveTodo = async () => {
        if (!removeTarget) return

        const { recommend, index } = removeTarget
        setRemoveTarget(null)

        if (!onRemoveTodo) {
            console.error("onRemoveTodo가 전달되지 않았습니다.")
            return
        }

        try {
            setProcessingIndex(index)
            await onRemoveTodo(recommend.task)
        } catch (error) {
            console.error("AI 추천 Todo 제거 실패:", error)
            setErrorMessage(error.message || "Todo를 처리하지 못했습니다.")
        } finally {
            setProcessingIndex(null)
        }
    }

    return (
        <>
        <section>
            <div className="aiReportHeader">
                <h3>오늘 Todo 추천</h3>
            </div>

            {recommendations.length === 0 ? (
                <p className="aiReportError">
                    추천할 Todo 내용이 없습니다.
                </p>
            ) : (
                <ul className="aiRecommendationList">
                    {recommendations.map((recommend, index) => {
                        // 오늘 홈 Todo에 추가된 상태
                        const added = isTodoAdded(recommend.task)

                        // 홈에서 체크하여 실제 완료한 상태
                        const completed = isTodoCompleted(recommend.task)

                        const processing = processingIndex === index

                        return (
                            <li
                                key={`${recommend.day}-${index}`}
                                className={`aiRecommendationItem ${
                                    added ? "aiRecommendationItemAdded" : ""
                                }`}
                            >
                                {/* 추천 순서 */}
                                <span className="aiRecommendationNumber">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                {/* Todo 핵심 정보 */}
                                <div className="aiRecommendationMain">
                                    <p
                                        className={`aiRecommendationTask ${
                                            completed
                                                ? "aiRecommendationTaskCompleted"
                                                : ""
                                        }`}
                                    >

                                        <span className="aiRecommendationTaskText">
                                            {recommend.task}
                                        </span>

                                        {/* 소요시간 */}
                                        {recommend.duration && (
                                            <span className="aiRecommendationDuration">
                                                {recommend.duration}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* 예상 효과 */}
                                {recommend.effect && (
                                    <div className="aiRecommendationEffect">
                                        <span className="aiRecommendationEffectLabel">
                                            예상 효과
                                        </span>

                                        <span className="aiRecommendationEffectText">
                                            {recommend.effect}
                                        </span>
                                    </div>
                                )}

                                {/* Todo 추가/제거 버튼 */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleTodoButton(
                                            recommend,
                                            index
                                        )
                                    }
                                    disabled={processing}
                                    className={`aiRecommendationButton ${
                                        added
                                            ? "aiRecommendationButtonAdded"
                                            : ""
                                    }`}
                                >
                                    {processing
                                        ? "처리 중..."
                                        : added
                                            ? "추가됨"
                                            : "+ 추가"}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>

        {/* 이미 추가된 Todo 제거 확인 */}
        <AppAlert
            open={Boolean(removeTarget)}
            type="warning"
            title="홈 Todo에서 제거하시겠습니까?"
            message={
                removeTarget
                    ? `"${removeTarget.recommend.task}"을(를) 홈 Todo에서 제거합니다.`
                    : ""
            }
            showCancel
            confirmText="제거"
            onCancel={() => setRemoveTarget(null)}
            onClose={() => setRemoveTarget(null)}
            onConfirm={confirmRemoveTodo}
        />

        {/* AI Todo 처리 실패 안내 */}
        <AppAlert
            open={Boolean(errorMessage)}
            type="danger"
            title="Todo 처리 실패"
            message={errorMessage}
            onConfirm={() => setErrorMessage("")}
            onClose={() => setErrorMessage("")}
        />
        </>
    )
}