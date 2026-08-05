import React, { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { TimerProvider } from "../context/TimerContext"
import { addTodo, deleteTodo, getTodoList } from "../features/home/api/todo"
    
export default function MainLayout() {
    const [userInfo, setUserInfo] = useState(() => {
        const savedUser = localStorage.getItem("user")
        return savedUser ? JSON.parse(savedUser) : null
    })

    const [todoRefreshKey, setTodoRefreshKey] = useState(0) 
    const [todayTodos, setTodayTodos] = useState([])

    const syncTodayTodos = async () => {
        try {
            const data = await getTodoList()
            setTodayTodos(Array.isArray(data?.todo) ? data.todo : [])
        } catch (error) {
            console.error("오늘 Todo 조회 실패:", error)
        }
    }

    useEffect(() => {
        syncTodayTodos()
    }, [])

    const handleAddAiTodo = async (todoText) => {
        const trimmedTodo = todoText?.trim()
        if (!trimmedTodo) throw new Error("Todo 내용이 없습니다.")

        const alreadyAdded = todayTodos.some((todo) => todo.todo?.trim() === trimmedTodo)
        if (alreadyAdded) return

        await addTodo(trimmedTodo)
        await syncTodayTodos()
        setTodoRefreshKey((prev) => prev + 1)
    }

    const handleRemoveAiTodo = async (todoText) => {
        const trimmedTodo = todoText?.trim()
        const targetTodo = todayTodos.find((todo) => todo.todo?.trim() === trimmedTodo)

        if (!targetTodo?._id) {
            await syncTodayTodos()
            return
        }

        await deleteTodo(targetTodo._id)
        await syncTodayTodos()
        setTodoRefreshKey((prev) => prev + 1)
    }

    const handleTodoListChanged = async () => {
        await syncTodayTodos()
    }

    return (
        <TimerProvider>
            <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
                <Sidebar
                    userInfo={userInfo}
                    todayTodos={todayTodos}
                    onAddTodo={handleAddAiTodo}
                    onRemoveTodo={handleRemoveAiTodo}
                />
                <main style={{ flex: 1, backgroundColor: "#F8F8FC", overflow: "auto" }}>
                    <Outlet context={{
                        todoRefreshKey,
                        handleTodoListChanged
                    }} />
                </main>
            </div>
        </TimerProvider>
    )
}