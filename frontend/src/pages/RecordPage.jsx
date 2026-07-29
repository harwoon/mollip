import React, { useState } from 'react'
import TotalStudy from '../features/record/components/TotalStudy.jsx'
import TabSelector from '../features/record/components/TabSelector.jsx'
import DateSelector from '../features/record/components/DateSelector.jsx'
import TotalSubject from "../features/record/components/TotalSubject.jsx"
import BarSubject from "../features/record/components/BarSubject.jsx"
import LongestStudy from '../features/record/components/LongestStudy.jsx'
import HitCalendar from '../features/record/components/HitCalendar.jsx'
import Todo from '../features/record/components/Todo.jsx'

export default function RecordPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [recordType, setRecordType] = useState("daily")

  return (
    <div>
      <div>
        <div>
          <h2>기록</h2>
          <TabSelector
            currentType={recordType}
            onChangeType={setRecordType}
          />
        </div>

        <DateSelector
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
        />
      </div>


      {/* 총 공부시간 */}
      <TotalStudy
        selectedDate={selectedDate}
        type={recordType}
      />


      {/* 과목별 공부시간 */}
      <TotalSubject
        selectedDate={selectedDate}
        type={recordType}
      />

      {/* 과목 공부시간 - 막대 그래프 */}
      <BarSubject
        selectedDate={selectedDate}
        type={recordType}
      />

      {/* 집중시간 */}
      <LongestStudy
        selectedDate={selectedDate}
        type={recordType}
      />

      {/* 히트 캘린더 - 월간 */}
      <HitCalendar
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
      />

      {/* 목표 달성률 */}
      <Todo
        selectedDate={selectedDate}
        type={recordType}
      />

    </div>
  )
}