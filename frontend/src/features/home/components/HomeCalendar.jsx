import React, { useState } from 'react'
import Calendar from 'react-calendar'
import dayjs from 'dayjs'
import './HomeCalendar.css'

export default function HomeCalendar() {
  const [date, setDate] = useState(new Date())

  return (
    <div className="calendar-container">
      <Calendar
        onChange={setDate}
        value={date}
        formatDay={(locale, date) => dayjs(date).format('D')} 
        next2Label={null}
        prev2Label={null}
      />
    </div>
  )
}