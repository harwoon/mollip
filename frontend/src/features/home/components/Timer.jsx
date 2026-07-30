import React, { useState, useEffect, useRef } from 'react'
import styles from './Timer.module.css'
import { io } from 'socket.io-client'

const socket = io("http://localhost:3000", {
  autoConnect: true
})


export default function Timer({
  selectedSubject = null,
  onSaveTime,
  userInfo,
  dailyRecords,
  time,
  setTime,
  isRunning,
  setIsRunning,
  actualStartTime,
  setActualStartTime
}) {

  const [lastSavedTime, setLastSavedTime] = useState(0)
  
  const [timerStatus, setTimerStatus] = useState('IDLE')
  const prevSubjectName = useRef(null)

  // 💡 커스텀 알럿창을 띄우기 위한 상태
  const [alertMessage, setAlertMessage] = useState(null)

  const groupId = userInfo?.groupId
  const userId = userInfo?._id
  const userName = userInfo?.nickname
  const profileImg = userInfo?.profileImg

  useEffect(() => {
    const currentName = selectedSubject?.subjectName || selectedSubject
    if (prevSubjectName.current !== currentName) {
      setLastSavedTime(0)
      setTimerStatus('IDLE')
      prevSubjectName.current = currentName
    }
  }, [selectedSubject])

  // 💡 상태에 따른 타이머 숫자 글자 색상 (IDLE: 보라색, RUNNING/STOPPED: 흰색)
  let numberColor = '#8a6bc7'
  if (timerStatus === 'RUNNING' || timerStatus === 'STOPPED') {
    numberColor = '#ffffff'
  }

  const formatTime = (currentTime) => {
    const hours = Math.floor(currentTime / 360000)
    const minutes = Math.floor((currentTime % 360000) / 6000)
    const seconds = Math.floor((currentTime % 6000) / 100)
    const milliseconds = currentTime % 100

    return (
      <span style={{ color: numberColor, transition: 'color 0.3s ease' }}>
        {hours}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        <span className={styles.milliseconds} style={{ color: numberColor }}>
          .{String(milliseconds).padStart(2, '0')}
        </span>
      </span>
    )
  }

  // 총 공부 시간 포맷 함수
  const formatTotalTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // '총 공부한 시간' 계산 (DB에 저장된 기록들 + 현재 돌아가고 있는 타이머 시간)
  const getRealTimeTotalSeconds = () => {
    const dbTotalSeconds = (dailyRecords || []).reduce((sum, record) => {
      return sum + (record.sumStudyTime || 0)
    }, 0)
    return dbTotalSeconds
  }

  // '며칠째'인지 계산하는 함수 (가입일 기준)
  const getStudyDays = () => {
    if (!userInfo || !userInfo.createdAt) return 1

    const startDate = new Date(userInfo.createdAt)
    const today = new Date()

    startDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 // 당일은 1일째

    return diffDays > 0 ? diffDays : 1
  }

  // 메시지 만드는 함수
  const getStudyMessage = () => {
    if (selectedSubject) {
      const subjectName = selectedSubject.subjectName || selectedSubject

      if (timerStatus === 'RUNNING') {
        return `${subjectName} 공부를 진행중입니다.`
      }

      if (timerStatus === 'STOPPED') {
        return `${subjectName} 공부를 멈췄습니다.`
      }

      // 받침에 따라 '이' / '가'를 자동으로 바꿔줌
      const lastCharCode = subjectName.charCodeAt(subjectName.length - 1)
      const hasBatchim = (lastCharCode - 44032) % 28 > 0
      const particle = hasBatchim ? '이' : '가'

      return `${subjectName}${particle} 선택되었습니다. 공부를 시작하세요!`
    }

    if (!userInfo) {
      return '유저 정보 불러오는 중...'
    }

    const streak = userInfo.currentStreak || 0
    const userName = userInfo.nickname || '회원'

    // 스트릭이 0일 때 메시지
    if (streak === 0) {
      return `${userName}님, 공부를 시작하세요!`
    }

    // 스트릭이 1 이상일 때 메시지
    const days = getStudyDays()
    return (
      <>
        <span style={{ color: '#8a6bc7', fontWeight: 'bold', fontSize: '1.2em' }}>
          {days}
        </span>
        일째 학습을 이어나가세요!
      </>
    )
  }

  const handleStart = () => {
    // 1. 과목 미선택 시 Start 클릭
    if (!selectedSubject) {
      setAlertMessage("현재 진행 중인 공부가 없습니다.")
      return
    }
    // 2. 스타트를 누른 상태(공부 중)에서 한번 더 누를 때
    if (isRunning || timerStatus === 'RUNNING') {
      setAlertMessage("이미 공부중입니다.")
      return
    }

    setIsRunning(true)
    setTimerStatus('RUNNING')
    setActualStartTime(new Date())

    if (groupId && userId) {
      socket.emit('startStudy', { groupId, userId, userName, profileImg, subjectName: selectedSubject.subjectName })
    }

    console.log("프로필", profileImg)
  }

  const handleStop = async () => {
    // 3. 스톱을 누른 상태(정지 상태)에서 한번 더 누을 때
    if (!selectedSubject || !isRunning || timerStatus === 'STOPPED') {
      setAlertMessage("이미 공부를 중지했습니다.")
      return
    }

    setIsRunning(false)
    setTimerStatus('STOPPED')
    const actualEndTime = new Date()

    const currentSeconds = Math.floor(time / 100)
    const timeToSave = currentSeconds - lastSavedTime

    if (timeToSave > 0) {
      const isSuccess = await onSaveTime(timeToSave, actualStartTime, actualEndTime)

      if (isSuccess) {
        setLastSavedTime(currentSeconds)
      } else {
        alert('서버 문제로 기록이 저장되지 않았습니다. 다시 시도해 주세요.')
      }
    }

    if (groupId && userId) {
      socket.emit('stopStudy', { groupId, userId })
    }
  }

  // 💡 이미지와 일치하는 정확한 파스텔 색상 코드 적용
  let containerBg = '#fcfbf9' // 대기/기본 상태
  let textColor = '#555555'   // 상단 안내 문구 색상

  if (timerStatus === 'RUNNING') {
    containerBg = '#a8d5ba' // 민트/초록 계열 (이미지 참고)
    textColor = '#ffffff'   // 상단 문구 흰색
  } else if (timerStatus === 'STOPPED') {
    containerBg = '#f2c4c4' // 파스텔 핑크/붉은 계열 (이미지 참고)
    textColor = '#ffffff'   // 상단 문구 흰색
  }

  // 💡 이미지와 일치하는 버튼 동적 스타일 (RUNNING일 때 Start가 채워지고, STOPPED일 때 Stop이 채워짐)
  const startBtnStyle = {
    backgroundColor: timerStatus === 'RUNNING' ? '#ffffff' : 'transparent',
    color: timerStatus === 'RUNNING' ? '#a8d5ba' : (timerStatus === 'STOPPED' ? '#ffffff' : '#8a6bc7'),
    borderColor: timerStatus === 'STOPPED' ? '#ffffff' : '#ccc'
  }

  const stopBtnStyle = {
    backgroundColor: timerStatus === 'STOPPED' ? '#ffffff' : 'transparent',
    color: timerStatus === 'STOPPED' ? '#f2c4c4' : (timerStatus === 'RUNNING' ? '#ffffff' : '#8a6bc7'),
    borderColor: timerStatus === 'RUNNING' ? '#ffffff' : '#ccc'
  }

  return (
    <div className={styles.timerContainer} style={{ backgroundColor: containerBg, transition: 'background-color 0.3s ease' }}>

      <h2 className={styles.timerTitle} style={{ textAlign: 'center', marginBottom: '15px', color: textColor, transition: 'color 0.3s ease' }}>
        {getStudyMessage()}
      </h2>

      <div className={styles.timerDisplay}>
        {formatTime(time)}
      </div>

      <div className={styles.timerButtons}>
        <button className={styles.timerBtn} style={startBtnStyle} onClick={handleStart}>Start</button>
        <button className={styles.timerBtn} style={stopBtnStyle} onClick={handleStop}>Stop</button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', color: textColor === '#ffffff' ? '#ffffff' : '#666' }}>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>
          총 공부한 시간: <strong style={{ color: textColor === '#ffffff' ? '#ffffff' : '#333' }}>{formatTotalTime(getRealTimeTotalSeconds())}</strong>
        </p>
      </div>

      {/* 💡 커스텀 알럿창 UI */}
      {alertMessage && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px 25px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            width: '320px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong style={{ fontSize: '1rem', color: '#333' }}>알림</strong>
              <button 
                onClick={() => setAlertMessage(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>{alertMessage}</p>
          </div>
        </div>
      )}

    </div>
  )
}