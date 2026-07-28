import React from "react"
import Timer from "../features/home/components/Timer"

export default function HomePage() {
  return (
    <div style={{ padding: '40px' }}>
      <Timer
        userName="김사과"
        selectedSubject="파이썬"
      />

    </div>
  )
}