import React, { useState, useEffect } from 'react'
import { getStudyRecord } from '../api/study.js'
import dayjs from 'dayjs'

export default function TotalStudy({ selectedDate, type }) {
  const [hour, setHour] = useState(0)
  const [min, setMin] = useState(0)

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD')

        // API 요청
        const data = await getStudyRecord(type, formattedDate)
        
        const totalMinutes = data || 0

        setHour(Math.floor(totalMinutes / 60))
        setMin(totalMinutes % 60)

      } catch (error) {
        console.error("공부 시간을 가져오는데 실패했습니다:", error)
      }
    }

    fetchStudyTime()
  }, [selectedDate, type])

  return (
    <div>
      <h2>{hour}시간 {min}분</h2>
    </div>
  )
}