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
  dailyRecords
}) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState(0)
  const [actualStartTime, setActualStartTime] = useState(null)

  const expectedTimeRef = useRef(0)
  const startTimeRef = useRef(0)

  const groupId = userInfo?.groupId
  const userId = userInfo?._id
  const userName = userInfo?.nickname
  const profileImg = userInfo?.profileImg

  useEffect(() => {
    setTime(0)
    setLastSavedTime(0)
    setIsRunning(false)
    setActualStartTime(null)
    expectedTimeRef.current = 0
  }, [selectedSubject])

  useEffect(() => {
    let interval
    if (isRunning) {
      startTimeRef.current = Date.now()
      expectedTimeRef.current = time

      interval = setInterval(() => {
        const diffMs = Date.now() - startTimeRef.current
        const ticks = Math.floor(diffMs / 10)
        setTime(expectedTimeRef.current + ticks)
      }, 10)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (currentTime) => {
    const hours = Math.floor(currentTime / 360000)
    const minutes = Math.floor((currentTime % 360000) / 6000)
    const seconds = Math.floor((currentTime % 6000) / 100)
    const milliseconds = currentTime % 100

    return (
      <>
        {hours}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        <span className={styles.milliseconds}>
          .{String(milliseconds).padStart(2, '0')}
        </span>
      </>
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
      if (record.startTime && record.endTime) {
        const start = new Date(record.startTime).getTime()
        const end = new Date(record.endTime).getTime()
        return sum + Math.round((end - start) / 1000)
      }
      return sum
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

  const handleStart = () => {
    if (!selectedSubject) {
      alert('공부를 시작할 과목을 먼저 선택해 주세요.')
      return
    }
    setIsRunning(true)
    setActualStartTime(new Date())

    if (groupId && userId) {
      socket.emit('startStudy', { groupId, userId, userName, profileImg })
    }

    console.log("프로필",profileImg)
  }

  const handleStop = async () => {
    if (!selectedSubject || !isRunning) return

    setIsRunning(false)
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

  return (
    <div className={styles.timerContainer}>

      <h2 className={styles.timerTitle} style={{ textAlign: 'center', marginBottom: '15px' }}>
        {selectedSubject
          ? `${getStudyDays()}일째 공부중, 이어나가세요!`
          : (userName ? `${userName}님, 공부를 시작하세요!` : '유저 정보 불러오는 중...')}
      </h2>

      <div className={styles.timerDisplay}>
        {formatTime(time)}
      </div>

      <div className={styles.timerButtons}>
        <button className={styles.timerBtn} onClick={handleStart}>Start</button>
        <button className={styles.timerBtn} onClick={handleStop}>Stop</button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>
          총 공부한 시간: <strong style={{ color: '#333' }}>{formatTotalTime(getRealTimeTotalSeconds())}</strong>
        </p>
      </div>

    </div>
  )
}