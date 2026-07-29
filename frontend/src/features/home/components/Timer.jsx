import React, { useState, useEffect } from 'react'
import styles from './Timer.module.css'

export default function Timer({ userName, selectedSubject = null, onSaveTime }) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState(0)

  // start를 눌렀을때 state 추가
  const [actualStartTime, setActualStartTime] = useState(null)

  // 과목 변경 감지
  useEffect(() => {
    setTime(0)
    setLastSavedTime(0)
    setIsRunning(false)
    setActualStartTime(null)
  }, [selectedSubject])

  // 타이머 함수
  useEffect(() => {
    let interval
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 10)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // 시간 변환
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

  // 시작 버튼
  const handleStart = () => {
    if (!selectedSubject) {
      alert('공부를 시작할 과목을 먼저 선택해 주세요.')
      return
    }
    setIsRunning(true)
    setActualStartTime(new Date())
  }

  // 정지 및 저장 버튼
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
  }

  return (
    <div className={styles.timerContainer}>
      <h2 className={styles.timerTitle}>
        {userName ? `${userName}님, 공부를 시작하세요!` : '유저 정보 불러오는 중...'}
      </h2>
      <div className={styles.timerDisplay}>
        {formatTime(time)}
      </div>
      <div className={styles.timerButtons}>
        <button className={styles.timerBtn} onClick={handleStart}>Start</button>
        <button className={styles.timerBtn} onClick={handleStop}>Stop</button>
      </div>
    </div>
  )
}