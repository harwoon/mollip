import { useEffect, useState } from "react";
import { getTodoList } from "../api/home";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchTodoList = async () => {
      try {
        const data = await getTodoList();

        setTodos(data.todo);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodoList();
  }, []);

  if (loading) {
    return <p>투두리스트 불러오는 중...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleChange = (todoId) => {
    
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo._id === todoId ? { ...todo, state: !todo.state } : todo,
      ),
    );
  };

  return (
    <section>
      <h2>오늘의 할 일</h2>

      {todos.length === 0 ? (
        <p>등록된 할 일이 없습니다.</p>
      ) : (
        <div>
          <ul>
            {todos.map((todo) => (
              <li key={todo._id}>
                <input
                  type="checkbox"
                  id={todo._id}
                  checked={todo.state}
                  onChange={() => handleChange(todo._id)}
                />

                <label htmlFor={todo._id}>{todo.todo}</label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
