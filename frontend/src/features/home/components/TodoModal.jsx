import { useState } from "react"

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

      // 부모의 handleAddTodo 실행
      await onAdd(trimmedTodo)

      setTodoText("")
    } catch (error) {
      console.error("Todo 등록 실패:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h3>Todo 추가</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={todoText}
          placeholder="할 일을 입력해주세요."
          onChange={(event) => setTodoText(event.target.value)}
          autoFocus
        />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting ? "등록 중..." : "등록"}
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
        >
          취소
        </button>
      </form>
    </div>
  )
}