import React, { useState } from 'react'
import dayjs from 'dayjs'
import Calendar from 'react-calendar'

export default function DateSelector({ selectedDate, onChangeDate }) {
    const [isOpen, setIsOpen] = useState(false)

    const handlePrev = () => {
        onChangeDate(dayjs(selectedDate).subtract(1, 'day').toDate())
    }

    const handleNext = () => {
        onChangeDate(dayjs(selectedDate).add(1, 'day').toDate())
    }

    // 달력에서 날짜를 클릭했을 때 실행될 함수
    const handleDateClick = (newDate) => {
        onChangeDate(newDate) // 부모에게 바뀐 날짜 전달
        setIsOpen(false)      // 달력 팝업 닫기
    }

    return (

        <div className="date-selector-wrapper">
            <div className="date-selector-box">
                <span className="calendar-icon">📅</span>

                <span
                    className="date-text"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {dayjs(selectedDate).format('YYYY. MM. DD (ddd)')}
                </span>

                <div className="arrow-buttons">
                    <button onClick={handlePrev}>&lt;</button>
                    <button onClick={handleNext}>&gt;</button>
                </div>
            </div>

            {isOpen && (
                <div className="calendar-popup">
                    <Calendar
                        onChange={handleDateClick}
                        value={selectedDate}
                        formatDay={(locale, date) => dayjs(date).format('D')}
                        next2Label={null}
                        prev2Label={null}
                    />
                </div>
            )}
        </div>
    )
}