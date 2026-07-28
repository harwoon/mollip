import React, { useState, useEffect } from 'react'
import { getSubjectRecord } from '../api/study.js'
import dayjs from 'dayjs'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function TotalSubject({ selectedDate, type }) {
  const [hour, setHour] = useState(0)
  const [min, setMin] = useState(0)
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD')

        // API 요청
        const data = await getSubjectRecord(type, formattedDate)
        
        const totalMinutes = data.totalStudyTime || 0

        setHour(Math.floor(totalMinutes / 60))
        setMin(totalMinutes % 60)

        setSubjects(data.subjects || [])

      } catch (error) {
        console.error("과목공부 시간을 가져오는데 실패했습니다:", error)
      }
    }

    fetchStudyTime()
  }, [selectedDate, type])

  return (
    <div style={{ width: '100%', padding: '20px', backgroundColor: '#fcfbf9', borderRadius: '20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#888', fontSize: '0.9rem' }}>과목별 공부시간</h3>
        <h2 style={{ color: '#333', fontSize: '2rem', margin: '5px 0' }}>
          {hour}시간 {min}분
        </h2>
      </div>

      {/* 🌟 파이 차트 렌더링 영역 */}
      {subjects.length > 0 ? (
        <div style={{ width: '100%', height: '200px' }}>
          {/* 반응형 컨테이너: 부모 너비에 맞게 차트 크기를 자동 조절합니다 */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjects}
                dataKey="ratio"          // 파이 조각의 크기를 결정할 값 (비율)
                nameKey="studyTitle"     // 마우스를 올렸을 때 툴팁에 뜰 이름
                cx="50%"                 // 차트의 가로 중심 위치
                cy="50%"                 // 차트의 세로 중심 위치
                innerRadius={60}         // 안쪽 구멍 크기 (도넛 모양)
                outerRadius={80}         // 바깥쪽 꽉 찬 원 크기
                stroke="none"            // 조각 테두리 선 없애기
              >
                {/* 
                  배열을 돌면서 백엔드에서 받은 subjectColor를 
                  각 파이 조각의 배경색(fill)으로 칠해줍니다.
                */}
                {subjects.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.subjectColor} />
                ))}
              </Pie>
              {/* 마우스 올렸을 때 정보 표시 (비율%와 과목명) */}
              <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#aaa' }}>공부 기록이 없습니다.</p>
      )}

    </div>
  )
}