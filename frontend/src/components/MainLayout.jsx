import React, { useState, useEffect, useRef } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { addTodo, deleteTodo, getTodoList } from "../features/home/api/todo"

const API_URL =
    import.meta.env.VITE_LOCAL_API_URL ||
    "http://127.0.0.1:3000"

    
export default function MainLayout() {
    const [userInfo, setUserInfo] = useState(() => {
        const savedUser = localStorage.getItem("user") // 로그인할 때 쓴 키 이름("user" 또는 "userInfo")
        return savedUser ? JSON.parse(savedUser) : null
    })
    // AI todo 추가
    const [todoRefreshKey, setTodoRefreshKey] = useState(0) 
    // 오늘 홈 Todo 목록
    const [todayTodos, setTodayTodos] = useState([])

    // 새로고침해도 데이터가 안 날아가도록 localStorage에서 초기값을 불러옴.
    const [selectedSubject, setSelectedSubject] = useState(() => {
        const saved = localStorage.getItem("mollip_selectedSubject")
        return saved ? JSON.parse(saved) : null
    })

    const [time, setTime] = useState(() => {
        const saved = localStorage.getItem("mollip_time")
        return saved ? Number(saved) : 0
    })

    const [isRunning, setIsRunning] = useState(() => {
        const saved = localStorage.getItem("mollip_isRunning")
        return saved ? JSON.parse(saved) : false
    })

    const [actualStartTime, setActualStartTime] = useState(() => {
        const saved = localStorage.getItem("mollip_actualStartTime")
        return saved ? new Date(saved) : null
    })

    const expectedTimeRef = useRef(Number(localStorage.getItem("mollip_time")) || 0)
    
    // 과목 변경 감지용 Ref
    const prevSubjectRef = useRef(selectedSubject?._id)

    // 과목 및 상태 로컬스토리지 업데이트
    useEffect(() => {
        if (selectedSubject) {
            localStorage.setItem("mollip_selectedSubject", JSON.stringify(selectedSubject))
        } else {
            localStorage.removeItem("mollip_selectedSubject")
        }
    }, [selectedSubject])

    // 타이머가 정지(!isRunning) 상태일 때만 누적 시간 저장.
    useEffect(() => {
        if (!isRunning) {
            localStorage.setItem("mollip_time", time)
            expectedTimeRef.current = time
        }
    }, [isRunning, time])

    useEffect(() => {
        localStorage.setItem("mollip_isRunning", JSON.stringify(isRunning))
    }, [isRunning])

    useEffect(() => {
        if (actualStartTime) {
            localStorage.setItem("mollip_actualStartTime", actualStartTime.toISOString())
        } else {
            localStorage.removeItem("mollip_actualStartTime")
        }
    }, [actualStartTime])

    // 과목 바뀔 시 시간 완벽 리셋
    useEffect(() => {
        if (prevSubjectRef.current !== selectedSubject?._id) {
            setTime(0)
            setIsRunning(false)
            setActualStartTime(null)
            expectedTimeRef.current = 0

            localStorage.removeItem("mollip_time")
            localStorage.removeItem("mollip_isRunning")
            localStorage.removeItem("mollip_actualStartTime")

            prevSubjectRef.current = selectedSubject?._id
        }
    }, [selectedSubject?._id])

    // 타임스탬프 기반 타이머 엔진
    useEffect(() => {
        let interval
        if (isRunning && actualStartTime) {
            const startMs = new Date(actualStartTime).getTime()
            
            const baseTicks = expectedTimeRef.current

            interval = setInterval(() => {
                const diffMs = Date.now() - startMs
                const ticks = Math.floor(diffMs / 10)
                setTime(baseTicks + ticks)
            }, 10)
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [isRunning, actualStartTime])

    const handleGlobalSave = async (studySeconds) => {
        if (!selectedSubject) return false
        
        const userToken = localStorage.getItem("token")
        if (!userToken) return false

        try {
            const kstOffset = new Date().getTimezoneOffset() * 60000
            const todayString = new Date(Date.now() - kstOffset).toISOString().split("T")[0]

            const response = await fetch(`${API_URL}/study/addStudy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    studyTitle: selectedSubject.subjectName,
                    studyDate: todayString,
                    sumStudyTime: studySeconds,
                }),
            })

            if (!response.ok) throw new Error("서버 저장 실패")
            return true
        } catch (error) {
            console.error("전역 타이머 저장 에러:", error)
            return false
        }
    }

    const onStopAndSaveForLogout = async () => {
        if (isRunning) {
            const studySecondsToSave = Math.floor(time / 100) // 10ms 단위를 초 단위로 변환

            setIsRunning(false) // 즉시 멈춤
            await handleGlobalSave(studySecondsToSave)
        }
    }

    // 오늘 Todo 목록 다시 조회
    const syncTodayTodos = async () => {
        try {
            const data = await getTodoList()

            setTodayTodos(
                Array.isArray(data?.todo)
                    ? data.todo
                    : []
            )
        } catch (error) {
            console.error("오늘 Todo 조회 실패:", error)
        }
    }

    // 최초 실행 시 오늘 Todo 조회
    useEffect(() => {
        syncTodayTodos()
    }, [])

    // AI 추천 Todo 홈에 추가
    const handleAddAiTodo = async (todoText) => {
        const trimmedTodo = todoText?.trim()

        if (!trimmedTodo) {
            throw new Error("Todo 내용이 없습니다.")
        }

        // 오늘 같은 Todo가 이미 있으면 중복 추가 방지
        const alreadyAdded = todayTodos.some(
            (todo) => todo.todo?.trim() === trimmedTodo
        )

        if (alreadyAdded) {
            return
        }

        await addTodo(trimmedTodo)

        // AI 추천 목록 상태 갱신
        await syncTodayTodos()

        // 홈 TodoList 다시 조회
        setTodoRefreshKey((prev) => prev + 1)
    }

    // AI 추천의 추가된 Todo를 홈에서 제거
    const handleRemoveAiTodo = async (todoText) => {
        const trimmedTodo = todoText?.trim()

        const targetTodo = todayTodos.find(
            (todo) => todo.todo?.trim() === trimmedTodo
        )

        if (!targetTodo?._id) {
            await syncTodayTodos()
            return
        }

        await deleteTodo(targetTodo._id)

        // AI 추천 목록 상태 갱신
        await syncTodayTodos()

        // 홈 TodoList 다시 조회
        setTodoRefreshKey((prev) => prev + 1)
    }

    // 홈에서 Todo를 추가/삭제했을 때 AI 추천 목록 동기화
    const handleTodoListChanged = async () => {
        await syncTodayTodos()
    }

    return (
        <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
            {/* onAddTodo = AI todo */}
            <Sidebar
                selectedSubject={selectedSubject}
                time={time}
                isRunning={isRunning}
                userInfo={userInfo}
                onStopAndSave={onStopAndSaveForLogout}

                // AI Todo
                todayTodos={todayTodos}
                onAddTodo={handleAddAiTodo}
                onRemoveTodo={handleRemoveAiTodo}
            />
            <main style={{ flex: 1, backgroundColor: "#F8F8FC", overflow: "auto" }}>
                {/* todoRefreshKey = AI todo */}
                <Outlet context={{
                    selectedSubject, setSelectedSubject,
                    time, setTime,
                    isRunning, setIsRunning,
                    actualStartTime, setActualStartTime,
                    handleGlobalSave,

                    // AI Todo
                    todoRefreshKey,
                    handleTodoListChanged
                }} />
            </main>
        </div>
    )
}