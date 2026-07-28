import { useEffect, useState } from "react"
import {
  getTodoList,
  updateTodoState,
  deleteTodo,
  addTodo,
} from "../api/home"
import TodoModal from "./TodoModal"

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchTodoList = async () => {
      try {
        const data = await getTodoList()
        setTodos(data.todo)
        
      } catch (error) {
        console.error(error)
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
      await updateTodoState(
        selectedTodo._id,
        nextState,
      )

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === selectedTodo._id
            ? {
                ...todo,
                state: nextState,
              }
            : todo,
        ),
      )
    } catch (error) {
      console.error(
        "Todo 상태 변경 실패:",
        error,
      )
    }
  }

  const handleAddTodo = async (todoText) => {
    try {
      const result = await addTodo(todoText)

      // 서버에서 최신 TodoList 전체를 반환
      setTodos(result.todoList.todo)

      // 등록 성공 후 팝업 닫기
      setIsOpen(false)
    } catch (error) {
      console.error("Todo 추가 실패:", error)
      throw error
    }
  }

  const handleDelete = async (todoId) => {
    try {
      await deleteTodo(todoId)

      setTodos((prevTodos) =>
        prevTodos.filter(
          (todo) => todo._id !== todoId,
        ),
      )
    } catch (error) {
      console.error("Todo 삭제 실패:", error)
    }
  }

  if (loading) {
    return <p>투두리스트 불러오는 중...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <section>
      <h2>TodoList</h2>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
      >
        추가
      </button>

      {todos.length === 0 ? (
        <p>등록된 할 일이 없습니다.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo._id}>
              <input
                type="checkbox"
                id={todo._id}
                checked={Boolean(todo.state)}
                onChange={() =>
                  handleChange(todo)
                }
              />

              <label htmlFor={todo._id}>
                {todo.todo}
              </label>

              <button
                type="button"
                onClick={() =>
                  handleDelete(todo._id)
                }
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && (
        <TodoModal
          onAdd={handleAddTodo}
          onClose={() => setIsOpen(false)}
        />
      )}
    </section>
  )
}