import { useEffect, useState } from "react";
import { addTodo, deleteTodo, getTodoList, updateTodoState } from "../api/todo";
import TodoModal from "./TodoModal";

import {PiPlusCircle, PiCheck, PiTrash, PiPlus} from "react-icons/pi"
import styles from "./TodoList.module.css";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchTodoList = async () => {
      try {
        const data = await getTodoList();
        setTodos(Array.isArray(data?.todo) ? data.todo : []);
      } catch (error) {
        console.error("Todo 조회 실패:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodoList();
  }, []);

  const handleChange = async (selectedTodo) => {
    const nextState = !selectedTodo.state;

    try {
      await updateTodoState(selectedTodo._id, nextState);

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === selectedTodo._id ? { ...todo, state: nextState } : todo,
        ),
      );
    } catch (error) {
      console.error("Todo 상태 변경 실패:", error);
    }
  };

  const handleAddTodo = async (todoText) => {
    try {
      const result = await addTodo(todoText);

      setTodos(
        Array.isArray(result?.todoList?.todo) ? result.todoList.todo : [],
      );
      setIsOpen(false);
    } catch (error) {
      console.error("Todo 추가 실패:", error);
      throw error;
    }
  };

  const handleDelete = async (todoId) => {
    try {
      await deleteTodo(todoId);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== todoId));
    } catch (error) {
      console.error("Todo 삭제 실패:", error);
    }
  };

  if (loading) return <p>투두리스트 불러오는 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.todoContainer}>
      <div className={styles.todoHeader}>
        <h2>TodoList</h2>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsOpen(true)}
          aria-label="할 일 추가"
        >
          <PiPlusCircle />
        </button>
      </div>

      <div className={styles.todoContent}>
        {loading && (
          <p className={styles.todoMessage}>투두리스트 불러오는 중...</p>
        )}

        {!loading && error && (
          <p className={`${styles.todoMessage} ${styles.errorMessage}`}>
            {error}
          </p>
        )}

        {!loading && !error && todos.length === 0 && (
          <p className={styles.todoMessage}>등록된 할 일이 없습니다.</p>
        )}

        {!loading && !error && todos.length > 0 && (
          <ul className={styles.todoList}>
            {todos.map((todo) => (
              <li
                key={todo._id}
                className={`${styles.todoItem} ${
                  todo.state ? styles.completedItem : ""
                }`}
              >
                <label
                  className={styles.checkboxArea}
                  htmlFor={`todo-${todo._id}`}
                >
                  <input
                    id={`todo-${todo._id}`}
                    type="checkbox"
                    className={styles.checkbox}
                    checked={todo.state}
                    onChange={() => handleChange(todo)}
                  />

                  <span className={styles.checkboxDesign}>
                    <PiCheck />
                  </span>
                </label>

                <label htmlFor={`todo-${todo._id}`} className={styles.todoText}>
                  {todo.todo}
                </label>

                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDelete(todo._id)}
                  aria-label="할 일 삭제"
                >
                  <PiTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isOpen && (
        <TodoModal onAdd={handleAddTodo} onClose={() => setIsOpen(false)} />
      )}
    </div>
  )
}
