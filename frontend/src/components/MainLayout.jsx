import { useState, useEffect, useRef } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { TimerProvider } from "../context/TimerContext"
import { addTodo, deleteTodo, getTodoList } from "../features/home/api/todo"
import GroupNoticeModal from "./GroupNoticeModal"

import { consumeWeeklyGroupNotice} from "../features/auth/api/auth"


export default function MainLayout() {

    const [userInfo, setUserInfo] = useState(() => {
        const savedUser = localStorage.getItem("user")
        return savedUser ? JSON.parse(savedUser) : null
    })
    const [groupNotice, setGroupNotice] =
        useState(null)

    const [isGroupNoticeOpen, setIsGroupNoticeOpen] =
        useState(false)

    const groupNoticeCheckedRef =
        useRef(false)

    useEffect(() => {
        if (groupNoticeCheckedRef.current) {
            return
        }

        groupNoticeCheckedRef.current = true

        async function checkGroupNotice() {
            try {
                const data =
                    await consumeWeeklyGroupNotice()

                const notice =
                    data?.notice

                if (!notice) {
                    return
                }

                setGroupNotice(notice)
                setIsGroupNoticeOpen(true)

                localStorage.setItem(
                    "groupId",
                    notice.currentGroupId,
                )

                setUserInfo((previousUser) => {
                    if (!previousUser) {
                        return previousUser
                    }

                    const updatedUser = {
                        ...previousUser,
                        groupId:
                            notice.currentGroupId,
                    }

                    localStorage.setItem(
                        "user",
                        JSON.stringify(updatedUser),
                    )

                    return updatedUser
                })
            } catch (error) {
                console.error(
                    "주간 그룹 알림 조회 실패:",
                    error,
                )
            }
        }

        checkGroupNotice()
    }, [])
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
            <div className="app-shell">
                <Sidebar
                    userInfo={userInfo}
                    todayTodos={todayTodos}
                    onAddTodo={handleAddAiTodo}
                    onRemoveTodo={handleRemoveAiTodo}
                />
                <main className="app-main">
                    <Outlet context={{
                        todoRefreshKey,
                        handleTodoListChanged
                    }} />
                </main>
                <GroupNoticeModal
                    open={isGroupNoticeOpen}
                    notice={groupNotice}
                    onClose={() => {
                        setIsGroupNoticeOpen(false)
                        setGroupNotice(null)
                    }}
                />
            </div>
        </TimerProvider>
    )
} 