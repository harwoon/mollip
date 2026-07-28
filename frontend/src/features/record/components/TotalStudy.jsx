import React, { useState, useEffect } from 'react'
import { getStudyRecord } from '../api/study.js'
import dayjs from 'dayjs'

export default function TotalStudy({selectedDate,type}) {
  const [studyTime, setStudyTime] = useState("0시간 0분")
  
  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD')
        
        // API 요청
        const data = await getStudyRecord(type, formattedDate)
        
        setStudyTime(data.totalTime || "0시간 0분")
      } catch (error) {
        console.error("공부 시간을 가져오는데 실패했습니다:", error)
      }
    }

    fetchStudyTime()
  }, [selectedDate, type])

  return (
      <div>
        <h2>{studyTime}</h2>
      </div>
  )
}