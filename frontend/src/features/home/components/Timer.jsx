import React, { useState, useEffect, useRef } from 'react'
import styles from './Timer.module.css'

export default function Timer({ userName, selectedSubject = null, onSaveTime }) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState(0)
  const [actualStartTime, setActualStartTime] = useState(null)

  // 💡 브라우저 탭 이동 방어를 위한 비밀 무기 (useRef)
  const expectedTimeRef = useRef(0) // 멈췄을 때까지 누적된 시간
  const startTimeRef = useRef(0)    // setInterval이 시작된 진짜 시간

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
      // 타이머가 돌기 시작한 현재 시간을 찰칵 기록!
      startTimeRef.current = Date.now()
      // 지금까지 누적된 시간을 기록!
      expectedTimeRef.current = time 

      interval = setInterval(() => {
        // 🚨 핵심: 무지성 +1이 아니라, 진짜 흘러간 리얼타임을 계산해서 더해줍니다.
        // 브라우저가 다른 탭에 가서 농땡이를 피워도, 현재 시간(Date.now())은 속일 수 없기 때문에 
        // 탭으로 돌아오는 순간 밀린 시간을 한방에 점프해서 정확하게 띄워줍니다!
        const diffMs = Date.now() - startTimeRef.current
        const ticks = Math.floor(diffMs / 10)
        setTime(expectedTimeRef.current + ticks)
      }, 10)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning]) // 의존성 배열에 time을 빼서 리렌더링 폭주를 막습니다.

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

  const handleStart = () => {
    if (!selectedSubject) {
      alert('공부를 시작할 과목을 먼저 선택해 주세요.')
      return
    }
    setIsRunning(true)
    setActualStartTime(new Date())
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