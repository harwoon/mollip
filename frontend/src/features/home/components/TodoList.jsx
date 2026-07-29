import { useEffect, useState } from "react"
import { PiPlusCircle, PiTrash } from "react-icons/pi"
import { addTodo, deleteTodo, getTodoList, updateTodoState } from "../api/todo"
import TodoModal from "./TodoModal"
import styles from "./TodoList.module.css"

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchTodoList = async () => {
      try {
        const data = await getTodoList()
        setTodos(Array.isArray(data?.todo) ? data.todo : [])
      } catch (error) {
        console.error("Todo 조회 실패:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTodoList()
  }, [])

  const handleChange = async (selectedTodo) => {
    const nextState = !selectedTodo.state

    try {
      await updateTodoState(selectedTodo._id, nextState)

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === selectedTodo._id ? { ...todo, state: nextState } : todo,
        ),
      )
    } catch (error) {
      console.error("Todo 상태 변경 실패:", error)
    }
  }

  const handleAddTodo = async (todoText) => {
    try {
      const result = await addTodo(todoText)

      setTodos(Array.isArray(result?.todoList?.todo) ? result.todoList.todo : [])
      setIsOpen(false)
    } catch (error) {
      console.error("Todo 추가 실패:", error)
      throw error
    }
  }

  const handleDelete = async (todoId) => {
    try {
      await deleteTodo(todoId)
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== todoId))
    } catch (error) {
      console.error("Todo 삭제 실패:", error)
    }
  }

  if (loading) return <p>투두리스트 불러오는 중...</p>
  if (error) return <p>{error}</p>

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>TodoList</h2>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsOpen(true)}
          aria-label="Todo 추가"
        >
          <PiPlusCircle />
        </button>
      </div>

      {todos.length === 0 ? (
        <p className={styles.emptyMessage}>등록된 할 일이 없습니다.</p>
      ) : (
        <ul className={styles.todoList}>
          {todos.map((todo) => (
            <li
              key={todo._id}
              className={`${styles.todoItem} ${todo.state ? styles.completedItem : ""}`}
            >
              <input
                type="checkbox"
                id={todo._id}
                className={styles.checkbox}
                checked={Boolean(todo.state)}
                onChange={() => handleChange(todo)}
              />

              <label htmlFor={todo._id} className={styles.todoText}>
                {todo.todo}
              </label>

              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => handleDelete(todo._id)}
                aria-label="Todo 삭제"
              >
                <PiTrash />
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && <TodoModal onAdd={handleAddTodo} onClose={() => setIsOpen(false)} />}
    </section>
  )
}