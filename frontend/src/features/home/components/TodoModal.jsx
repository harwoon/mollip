import { useEffect, useState } from "react"
import AppAlert from "../../../components/common/AppAlert.jsx"
import AppModal from "../../../components/common/AppModal.jsx"
import styles from "./TodoModal.module.css"

const MAX_LENGTH = 50

export default function TodoModal({ onAdd, onClose }) {
    const [todoText, setTodoText] = useState("")
    const [submitting, setSubmitting] = useState(false)
    // 공통 AppAlert
    const [alertOpen, setAlertOpen] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()

        const trimmedTodo = todoText.trim()

        if (!trimmedTodo) {
            setAlertOpen(true)
            return
        }

        try {
            setSubmitting(true)
            await onAdd(trimmedTodo)
            setTodoText("")

        } catch (error) {
            console.error("Todo 등록 실패:", error)

        } finally {
            setSubmitting(false)
        }
    }

    // ESC 버튼으로 팝업 닫기
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !submitting) {
                onClose()
            }
        }
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [onClose, submitting])

    return (
        <>
            <AppModal
                open={true}
                type="action"
                title="Todo 추가하기"
                onClose={submitting ? undefined : onClose}
                closeOnOverlay={!submitting}
            >
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputBox}>
                        {/* GPT 수정 - textarea 기본 스타일은 common.css 사용 */}
                        <textarea
                            value={todoText}
                            placeholder="할 일을 입력하세요"
                            maxLength={MAX_LENGTH}
                            onChange={(event) => setTodoText(event.target.value)}
                            autoFocus
                            className={`app-textarea ${styles.todoTextarea}`}
                        />

                        <span className={styles.counter}>
                            {todoText.length}/{MAX_LENGTH}
                        </span>
                    </div>

                    <div className={styles.buttonGroup}>
                        {/* GPT 수정 - 전용 취소 버튼 스타일 대신 공통 secondary 버튼 사용 */}
                        <button
                            type="button"
                            className="app-btn-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            취소
                        </button>

                        {/* GPT 수정 - 전용 추가 버튼 스타일 대신 공통 primary 버튼 사용 */}
                        <button
                            type="submit"
                            className="app-btn-primary"
                            disabled={submitting || !todoText.trim()}
                        >
                            {submitting ? "추가 중..." : "추가하기"}
                        </button>
                    </div>
                </form>
            </AppModal>

            {/* GPT 추가 - 비어 있는 Todo 검증을 공통 AppAlert로 표시 */}
            <AppAlert
                open={alertOpen}
                type="warning"
                title="할 일을 입력해주세요."
                onConfirm={() => setAlertOpen(false)}
                onClose={() => setAlertOpen(false)}
            />
        </>
    )
}
