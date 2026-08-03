import React, { useState, useEffect, useRef } from "react"
import styles from "./Timer.module.css"
import { socket } from "../../../../util/socket"


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

  const [timerStatus, setTimerStatus] = useState("IDLE")
  const prevSubjectName = useRef(null)

  const [alertMessage, setAlertMessage] = useState(null)

  const groupId = userInfo?.groupId
  const userId = userInfo?._id
  const userName = userInfo?.nickname
  const profileImg = userInfo?.profileImg
  const prevUserIdRef = useRef(userId)

  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      setTime(0)
      setIsRunning(false)
      setTimerStatus("IDLE")
      setLastSavedTime(0)
      prevUserIdRef.current = userId
    }
  }, [userId, setTime, setIsRunning])

  useEffect(() => {
    const currentName =
      selectedSubject?.subjectName || selectedSubject

    if (prevSubjectName.current !== currentName) {
      setLastSavedTime(0)
      setTimerStatus("IDLE")
      prevSubjectName.current = currentName
    }
  }, [selectedSubject])

  useEffect(() => {
    if (isRunning) {
      setTimerStatus("RUNNING")
    } else if (!isRunning && time > 0) {
      setTimerStatus("STOPPED")
      setLastSavedTime(Math.floor(time / 100))
    }
  }, [isRunning])

  let numberColor = "#8a6bc7"

  if (
    timerStatus === "RUNNING" ||
    timerStatus === "STOPPED"
  ) {
    numberColor = "#ffffff"
  }

  const formatTime = (currentTime) => {
    const hours = Math.floor(currentTime / 360000)
    const minutes = Math.floor(
      (currentTime % 360000) / 6000
    )
    const seconds = Math.floor(
      (currentTime % 6000) / 100
    )
    const milliseconds = currentTime % 100

    return (
      <span
        style={{
          color: numberColor,
          transition: "color 0.3s ease"
        }}
      >
        {hours}:
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}

        <span
          className={styles.milliseconds}
          style={{
            color: numberColor
          }}
        >
          .{String(milliseconds).padStart(2, "0")}
        </span>
      </span>
    )
  }

  // 총 공부 시간 포맷 함수
  const formatTotalTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  // '총 공부한 시간' 계산
  const getRealTimeTotalSeconds = () => {
    const dbTotalSeconds = (dailyRecords || []).reduce(
      (sum, record) => {
        return sum + (record.sumStudyTime || 0)
      },
      0
    )

    return dbTotalSeconds
  }

  // 가입일 기준 학습 일수 계산
  const getStudyDays = () => {
    if (!userInfo || !userInfo.createdAt) return 1

    const startDate = new Date(userInfo.createdAt)
    const today = new Date()

    startDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime =
      today.getTime() - startDate.getTime()

    const diffDays =
      Math.floor(
        diffTime / (1000 * 60 * 60 * 24)
      ) + 1

    return diffDays > 0 ? diffDays : 1
  }

  // 타이머 메시지
  const getStudyMessage = () => {
    if (selectedSubject) {
      const subjectName =
        selectedSubject.subjectName || selectedSubject

      if (timerStatus === "RUNNING") {
        return `${subjectName} 공부를 진행중입니다.`
      }

      if (timerStatus === "STOPPED") {
        return `${subjectName} 공부를 멈췄습니다.`
      }

      const lastCharCode = subjectName.charCodeAt(
        subjectName.length - 1
      )

      const hasBatchim =
        (lastCharCode - 44032) % 28 > 0

      const particle = hasBatchim ? "이" : "가"

      return `${subjectName}${particle} 선택되었습니다. 공부를 시작하세요!`
    }

    if (!userInfo) {
      return "유저 정보 불러오는 중..."
    }

    const streak = userInfo.currentStreak || 0
    const userName = userInfo.nickname || "회원"

    if (streak === 0) {
      return `${userName}님, 공부를 시작하세요!`
    }

    const days = getStudyDays()

    return (
      <>
        <span className={styles.studyDay}>
          {days}
        </span>
        일째 학습을 이어나가세요!
      </>
    )
  }

  const handleStart = () => {
    // 과목 미선택 시 Start 클릭
    if (!selectedSubject) {
      setAlertMessage(
        "현재 진행 중인 공부가 없습니다."
      )
      return
    }

    // 이미 공부 중일 때 Start 재클릭
    if (
      isRunning ||
      timerStatus === "RUNNING"
    ) {
      setAlertMessage("이미 공부중입니다.")
      return
    }

    setIsRunning(true)
    setTimerStatus("RUNNING")
    setActualStartTime(new Date())

    if (groupId && userId) {
      socket.emit("startStudy", {
        groupId,
        userId,
        userName,
        profileImg,
        subjectName:
          selectedSubject.subjectName
      })
    }

    console.log("프로필", profileImg)
  }

  const handleStop = async () => {
    // 이미 정지 상태일 때 Stop 재클릭
    if (
      !selectedSubject ||
      !isRunning ||
      timerStatus === "STOPPED"
    ) {
      setAlertMessage(
        "이미 공부를 중지했습니다."
      )
      return
    }

    setIsRunning(false)
    setTimerStatus("STOPPED")

    const actualEndTime = new Date()

    const currentSeconds =
      Math.floor(time / 100)

    const timeToSave =
      currentSeconds - lastSavedTime

    if (timeToSave > 0) {
      const isSuccess = await onSaveTime(
        timeToSave,
        actualStartTime,
        actualEndTime
      )

      if (isSuccess) {
        setLastSavedTime(currentSeconds)
      } else {
        alert(
          "서버 문제로 기록이 저장되지 않았습니다. 다시 시도해 주세요."
        )
      }
    }

    if (groupId && userId) {
      socket.emit("stopStudy", {
        groupId,
        userId
      })
    }
  }

  const timerStatusClass =
    timerStatus === "RUNNING"
      ? styles.timerRunning
      : timerStatus === "STOPPED"
        ? styles.timerStopped
        : styles.timerIdle

  return (
    <div
      className={`${styles.timerContainer} ${timerStatusClass}`}
    >
      <h2 className={styles.timerTitle}>
        {getStudyMessage()}
      </h2>

      <div className={styles.timerDisplay}>
        {formatTime(time)}
      </div>

      <div className={styles.timerButtons}>
        <button
          type="button"
          className={`${styles.timerBtn} ${styles.startButton}`}
          onClick={handleStart}
        >
          Start
        </button>

        <button
          type="button"
          className={`${styles.timerBtn} ${styles.stopButton}`}
          onClick={handleStop}
        >
          Stop
        </button>
      </div>

      <div className={styles.totalTimeArea}>
        <p className={styles.totalTimeText}>
          총 공부한 시간:{" "}

          <strong>
            {formatTotalTime(
              getRealTimeTotalSeconds()
            )}
          </strong>
        </p>
      </div>

      {/* 기존 커스텀 알럿창 유지 */}
      {alertMessage && (
        <div className={styles.alertOverlay}>
          <div className={styles.alertBox}>
            <div className={styles.alertHeader}>
              <strong>알림</strong>

              <button
                type="button"
                className={styles.alertCloseButton}
                onClick={() =>
                  setAlertMessage(null)
                }
                aria-label="알림 닫기"
              >
                ✕
              </button>
            </div>

            <p className={styles.alertMessage}>
              {alertMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}