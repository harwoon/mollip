import React, { useState, useEffect } from 'react';
import styles from './Timer.module.css'; 

// 컴포넌트 선언 및 상태 준비
export default function Timer({ userName, selectedSubject = null }) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  // 타이머 동작
  useEffect(() => {
    let interval
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // 시간, 분, 초 계산
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // 타이머 start
  const handleStart = () => {
    if (!selectedSubject) {
      alert('공부를 시작할 과목을 먼저 선택해 주세요.')
      return
    }
    setIsRunning(true)
  }

  // 타이머 stop
  const handleStop = () => {
    if (!selectedSubject) {
      alert('현재 진행 중인 공부가 없습니다.')
      return;
    }
    setIsRunning(false)
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
