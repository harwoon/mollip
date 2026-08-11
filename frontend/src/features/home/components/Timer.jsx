import { useState, useEffect } from "react"
import styles from "./Timer.module.css"
import AppAlert from "../../../components/common/AppAlert.jsx"

export default function Timer({
  selectedSubject = null,
  userInfo,
  dailyRecords,
  time,
  isRunning,
  timerStatus,
  isSaving,
  startTimer,
  stopTimer
}) {
  const [alertMessage, setAlertMessage] = useState(null)

  useEffect(() => {
    const handleUnsupportedFloatingTimer = () => {
      setAlertMessage("이 브라우저는 플로팅 타이머를 지원하지 않습니다. 최신 Chrome 또는 Edge를 사용해주세요.")
    }

    window.addEventListener(
      "mollip-floating-timer-unsupported",
      handleUnsupportedFloatingTimer
    )

    return () => {
      window.removeEventListener(
        "mollip-floating-timer-unsupported",
        handleUnsupportedFloatingTimer
      )
    }
  }, [])

  let numberColor = "#8a6bc7"
  if (timerStatus === "RUNNING" || timerStatus === "STOPPED" || timerStatus === "SAVING") {
    numberColor = "#ffffff"
  }

  const formatTime = (currentTime) => {
    const hours = Math.floor(currentTime / 360000)
    const minutes = Math.floor((currentTime % 360000) / 6000)
    const seconds = Math.floor((currentTime % 6000) / 100)
    const milliseconds = currentTime % 100

    return (
      <span style={{ color: numberColor, transition: "color 0.3s ease" }}>
        {hours}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        <span className={styles.milliseconds} style={{ color: numberColor }}>
          .{String(milliseconds).padStart(2, "0")}
        </span>
      </span>
    )
  }

  const formatTotalTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const getRealTimeTotalSeconds = () => {
    const dbTotalSeconds = (dailyRecords || []).reduce((sum, record) => {
      return sum + (record.sumStudyTime || 0)
    }, 0)
    return dbTotalSeconds
  }

  const getStudyDays = () => {
    if (!userInfo || !userInfo.createdAt) return 1
    const startDate = new Date(userInfo.createdAt)
    const today = new Date()
    startDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays > 0 ? diffDays : 1
  }

  const getStudyMessage = () => {
    if (selectedSubject) {
      const subjectName = selectedSubject.subjectName || selectedSubject
      if (timerStatus === "RUNNING") return `${subjectName} 공부를 진행중입니다.`
      if (timerStatus === "STOPPED") return `${subjectName} 공부를 멈췄습니다.`
      if (timerStatus === "SAVING") return `${subjectName} 공부 기록을 저장중입니다.`
      
      const lastCharCode = subjectName.charCodeAt(subjectName.length - 1)
      const hasBatchim = (lastCharCode - 44032) % 28 > 0
      const particle = hasBatchim ? "이" : "가"
      return `${subjectName}${particle} 선택되었습니다. 공부를 시작하세요!`
    }

    if (!userInfo) return "사용자 정보 불러오는 중..."
    const streak = userInfo.currentStreak || 0
    const userName = userInfo.nickname || "회원"
    if (streak === 0) return `${userName}님, 공부를 시작하세요!`
    
    const days = getStudyDays()
    return (
      <>
        <span className={styles.studyDay}>{days}</span>
        일째 학습을 이어나가세요!
      </>
    )
  }

  const handleStart = () => {
    if (!selectedSubject) {
      setAlertMessage("현재 진행 중인 공부가 없습니다.")
      return
    }
    if (isRunning || timerStatus === "RUNNING" || isSaving) {
      setAlertMessage("이미 공부중입니다.")
      return
    }

    startTimer()
  }

  const handleStop = async () => {

    if (!selectedSubject || !isRunning || timerStatus === "STOPPED" || isSaving) {
        setAlertMessage("이미 공부를 중지했습니다.")
        return
    }

    const saved = await stopTimer("manual")
    if (!saved) {
      setAlertMessage("서버 문제로 기록이 저장되지 않았습니다. 타이머를 계속 진행합니다.")
    }
  }

  const timerStatusClass = timerStatus === "RUNNING"
    ? styles.timerRunning
    : timerStatus === "STOPPED" || timerStatus === "SAVING"
      ? styles.timerStopped
      : styles.timerIdle

  return (
    <div className={`${styles.timerContainer} ${timerStatusClass}`}>
      <h2 className={styles.timerTitle}>{getStudyMessage()}</h2>

      <div className={styles.timerDisplay}>
        {formatTime(time)}
      </div>

      <div className={styles.timerButtons}>
        <button type="button" className={`${styles.timerBtn} ${styles.startButton}`} onClick={handleStart} disabled={isRunning || isSaving}>
          {isSaving ? "저장 중" : "Start"}
        </button>
        <button type="button" className={`${styles.timerBtn} ${styles.stopButton}`} onClick={handleStop} disabled={isSaving}>
          {isSaving ? "저장 중" : "Stop"}
        </button>
        {isRunning && (
          <button
            type="button"
            className={styles.timerBtn}
            onClick={() => window.dispatchEvent(new Event("mollip-open-floating-timer"))}
          >
            Floating
          </button>
        )}
      </div>

      <div className={styles.totalTimeArea}>
        <p className={styles.totalTimeText}>
          총 공부한 시간: <strong>{formatTotalTime(getRealTimeTotalSeconds())}</strong>
        </p>
      </div>

      {/* 공통 AppAlert */}
      <AppAlert
        open={Boolean(alertMessage)}
        type="warning"
        title="알림"
        message={alertMessage || ""}
        onConfirm={() => setAlertMessage(null)}
        onClose={() => setAlertMessage(null)}
      />
    </div>
    
  )
}
