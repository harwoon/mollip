import React from "react"
// 1. 필요한 부품(컴포넌트)들을 모두 불러옵니다.
import Timer from "../features/home/components/Timer"
import TodoList from "../features/home/components/TodoList"
import HomeCalendar from "../features/home/components/HomeCalendar"

export default function HomePage() {
  return (
    <div style={{ padding: '40px' }}>
      <Timer
        userName="김사과"
        selectedSubject="파이썬"
      />
      <div>
        <TodoList />
      </div>
      <HomeCalendar />
    </div>
  )
}