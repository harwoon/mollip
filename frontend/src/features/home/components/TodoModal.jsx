import { useEffect, useState } from "react"
import styles from "./TodoModal.module.css"

const MAX_LENGTH = 50

export default function TodoModal({ onAdd, onClose }) {
  const [todoText, setTodoText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedTodo = todoText.trim()

    if (!trimmedTodo) {
      alert("할 일을 입력해주세요.")
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
    <div
      className={styles.overlay}
      onMouseDown={() => {
        if (!submitting) {
          onClose()
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="todo-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3
          id="todo-modal-title"
          className={styles.title}
        >
          Todo 추가하기
        </h3>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputBox}>
            <textarea
              value={todoText}
              placeholder="할 일을 입력하세요"
              maxLength={MAX_LENGTH}
              onChange={(event) =>
                setTodoText(event.target.value)
              }
              autoFocus
            />

            <span className={styles.counter}>
              {todoText.length}/{MAX_LENGTH}
            </span>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={submitting}
            >
              취소
            </button>

            <button
              type="submit"
              className={styles.addButton}
              disabled={
                submitting || !todoText.trim()
              }
            >
              {submitting ? "추가 중..." : "추가하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}