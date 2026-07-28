import React, { useState, useEffect } from 'react'
import { getSubjectRecord } from '../api/study.js'
import dayjs from 'dayjs'


export default function TotalSubject({ selectedDate, type }) {
  const [hour, setHour] = useState(0)
  const [min, setMin] = useState(0)

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD')

        // API 요청
        const data = await getSubjectRecord(type, formattedDate)
        
        const totalMinutes = data.totalStudyTime || 0

        setHour(Math.floor(totalMinutes / 60))
        setMin(totalMinutes % 60)

      } catch (error) {
        console.error("과목공부 시간을 가져오는데 실패했습니다:", error)
      }
    }

    fetchStudyTime()
  }, [selectedDate, type])

  return (
    <div>
      <h3>과목 공부시간</h3>
      <h2>{hour}시간 {min}분</h2>
    </div>
  )
}