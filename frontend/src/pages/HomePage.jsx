import React, { useState, useEffect } from "react"
import Timer from "../features/home/components/Timer"
import TodoList from "../features/home/components/TodoList"
import HomeCalendar from "../features/home/components/HomeCalendar"
import SubjectList from "../features/home/components/SubjectList"
import { getMyInfo } from "../features/auth/api/auth"

export default function HomePage() {
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [dailyRecords, setDailyRecords] = useState([])

  const [userInfo, setUserInfo] = useState(null)
  const userToken = localStorage.getItem("token") 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getMyInfo()
        setUserInfo(userData.user)

        const kstOffset = new Date().getTimezoneOffset() * 60000
        const todayKST = new Date(Date.now() - kstOffset).toISOString().split('T')[0]

        const subjectRes = await fetch('http://127.0.0.1:3000/auth/subject', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        })
        
        if (subjectRes.ok) {
          const subjectData = await subjectRes.json()
          let finalSubjects = []
          if (Array.isArray(subjectData)) finalSubjects = subjectData
          else if (subjectData && typeof subjectData === 'object') {
            const arrayKey = Object.keys(subjectData).find(key => Array.isArray(subjectData[key]))
            if (arrayKey) finalSubjects = subjectData[arrayKey]
            else if (subjectData.subjectName) finalSubjects = [subjectData]
          }
          setSubjects(finalSubjects)
        }

        const recordRes = await fetch(`http://127.0.0.1:3000/study/records?type=daily&date=${todayKST}`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        })
        
        if (recordRes.ok) {
          const recordData = await recordRes.json()
          let finalRecords = []
          if (Array.isArray(recordData)) finalRecords = recordData
          else if (recordData && typeof recordData === 'object') {
            const arrayKey = Object.keys(recordData).find(key => Array.isArray(recordData[key]))
            if (arrayKey) finalRecords = recordData[arrayKey]
          }
          setDailyRecords(finalRecords)
        }
      } catch (error) {
        console.error("데이터 불러오기 실패:", error)
      }
    }
    fetchData()
  }, [])

  const handleSaveRecord = async (studySeconds, actualStartTime, actualEndTime) => {
    if (!selectedSubject) return false

    const newRecord = {
      _id: `temp_${Date.now()}`,
      studyTitle: selectedSubject.subjectName,
      startTime: actualStartTime.toISOString(),
      endTime: actualEndTime.toISOString()
    }
    
    setDailyRecords((prev) => [...prev, newRecord])

    try {
      const kstOffset = new Date().getTimezoneOffset() * 60000
      const todayString = new Date(actualStartTime.getTime() - kstOffset).toISOString().split('T')[0]

      const response = await fetch('http://127.0.0.1:3000/study/addStudy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` 
        },
        body: JSON.stringify({
          studyTitle: selectedSubject.subjectName,
          studyDate: todayString,
          startTime: actualStartTime.toISOString(),
          endTime: actualEndTime.toISOString(),
          sumStudyTime: Math.floor(studySeconds / 60)
        })
      })
      
      if (!response.ok) throw new Error('서버 저장 실패')
      return true
    } catch (error) {
      console.error("저장 에러:", error)
      setDailyRecords((prev) => prev.filter(record => record._id !== newRecord._id))
      return false
    }
  }

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '30px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ flex: 6.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <Timer 
            groupId={userInfo?.groupId}
            userId={userInfo?._id}
            userName={userInfo?.nickname}
            profileImg={userInfo?.profileImg}
            selectedSubject={selectedSubject} 
            onSaveTime={handleSaveRecord}
            userInfo={userInfo}
            dailyRecords={dailyRecords}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TodoList />
        </div>
      </div>

      <div style={{ flex: 3.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <SubjectList 
            subjects={subjects} 
            dailyRecords={dailyRecords} 
            selectedSubject={selectedSubject}
            onSelectSubject={(subject) => setSelectedSubject(subject)} 
          />
        </div>
        <div>
          <HomeCalendar />
        </div>
      </div>
    </div>
  )
}