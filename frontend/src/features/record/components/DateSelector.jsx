import React from 'react'
import dayjs from 'dayjs'

export default function DateSelector({ selectedDate, onChangeDate }) {
  // 이전 날짜로 이동
  const handlePrev = () => {
    const prevDate = dayjs(selectedDate).subtract(1, 'day').toDate()
    onChangeDate(prevDate)
  };

  // 다음 날짜로 이동
  const handleNext = () => {
    const nextDate = dayjs(selectedDate).add(1, 'day').toDate()
    onChangeDate(nextDate)
  }

  return (
    <div className="date-selector-box">
      <span className="calendar-icon">📅</span>
      <span className="date-text">
        {dayjs(selectedDate).format('YYYY-MM-DD (ddd)')}
      </span>
      
      <div className="arrow-buttons">
        <button onClick={handlePrev}>&lt;</button>
        <button onClick={handleNext}>&gt;</button>
      </div>
    </div>
  )
}