import { useOutletContext } from "react-router-dom"
import React, { useEffect, useState } from "react"

import Timer from "../features/home/components/Timer"
import TodoList from "../features/home/components/TodoList"
import HomeCalendar from "../features/home/components/HomeCalendar"
import SubjectList from "../features/home/components/SubjectList"
import { getMyInfo } from "../features/auth/api/auth"

import styles from "./HomePage.module.css"

const API_URL =
  import.meta.env.VITE_LOCAL_API_URL ||
  "http://127.0.0.1:3000"

// 마이페이지에서 저장한 과목 순서를 홈 화면에도 적용
function applySavedSubjectOrder(subjectList) {
  const userId =
    localStorage.getItem("userId") || "unknown"

  const storageKey =
    `mollip-subject-order-${userId}`

  const savedOrderText =
    localStorage.getItem(storageKey)

  if (!savedOrderText) {
    return subjectList
  }

  try {
    const savedSubjectIds =
      JSON.parse(savedOrderText)

    if (!Array.isArray(savedSubjectIds)) {
      return subjectList
    }

    const subjectMap = new Map(
      subjectList.map((subject) => [
        subject._id,
        subject,
      ])
    )

    // 저장된 순서에 포함된 과목
    const orderedSubjects = savedSubjectIds
      .map((subjectId) =>
        subjectMap.get(subjectId)
      )
      .filter(Boolean)

    // 저장 이후 새로 추가된 과목
    const unorderedSubjects =
      subjectList.filter(
        (subject) =>
          !savedSubjectIds.includes(
            subject._id
          )
      )

    return [
      ...orderedSubjects,
      ...unorderedSubjects,
    ]
  } catch (error) {
    console.error(
      "홈 과목 순서 적용 실패:",
      error
    )

    return subjectList
  }
}

export default function HomePage() {
  const {
    selectedSubject,
    setSelectedSubject,
    time,
    setTime,
    isRunning,
    setIsRunning,
    actualStartTime,
    setActualStartTime,
    handleGlobalSave
  } = useOutletContext()

  const [subjects, setSubjects] =
    useState([])

  const [dailyRecords, setDailyRecords] =
    useState([])

  const [userInfo, setUserInfo] =
    useState(null)

  const [alertMessage, setAlertMessage] =
    useState("")

  const userToken =
    localStorage.getItem("token")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData =
          await getMyInfo()

        setUserInfo(userData.user)

        const kstOffset =
          new Date().getTimezoneOffset() *
          60000

        const todayKST = new Date(
          Date.now() - kstOffset
        )
          .toISOString()
          .split("T")[0]

        // 과목 조회
        const subjectRes = await fetch(
          `${API_URL}/auth/subject`,
          {
            headers: {
              Authorization:
                `Bearer ${userToken}`,
            },
          }
        )

        if (subjectRes.ok) {
          const subjectData =
            await subjectRes.json()

          let finalSubjects = []

          if (
            Array.isArray(
              subjectData
            )
          ) {
            finalSubjects =
              subjectData
          } else if (
            subjectData &&
            typeof subjectData ===
            "object"
          ) {
            const arrayKey =
              Object.keys(
                subjectData
              ).find((key) =>
                Array.isArray(
                  subjectData[key]
                )
              )

            if (arrayKey) {
              finalSubjects =
                subjectData[
                arrayKey
                ]
            } else if (
              subjectData.subjectName
            ) {
              finalSubjects = [
                subjectData,
              ]
            }
          }

          const orderedSubjects =
            applySavedSubjectOrder(
              finalSubjects
            )

          setSubjects(
            orderedSubjects
          )
        }

        // 오늘 공부 기록 조회
        const recordRes = await fetch(
          `${API_URL}/study/records?type=daily&date=${todayKST}`,
          {
            headers: {
              Authorization:
                `Bearer ${userToken}`,
            },
          }
        )

        if (recordRes.ok) {
          const recordData =
            await recordRes.json()

          let finalRecords = []

          if (
            Array.isArray(recordData)
          ) {
            finalRecords = recordData
          } else if (
            recordData &&
            typeof recordData ===
            "object"
          ) {
            const arrayKey =
              Object.keys(
                recordData
              ).find((key) =>
                Array.isArray(
                  recordData[key]
                )
              )

            if (arrayKey) {
              finalRecords =
                recordData[
                arrayKey
                ]
            }
          }

          setDailyRecords(
            finalRecords
          )
        }
      } catch (error) {
        console.error(
          "데이터 불러오기 실패:",
          error
        )
      }
    }

    fetchData()
  }, [userToken])

  // 타이머 기록 저장
  const handleSaveRecord = async (studySeconds) => {
    if (!selectedSubject) {
      return false
    }

    const newRecord = {
      _id: `temp_${Date.now()}`,
      studyTitle: selectedSubject.subjectName,
      sumStudyTime: studySeconds,
    }

    // 서버 응답 전에 화면에 우선 반영
    setDailyRecords((prev) => [
      ...prev,
      newRecord,
    ])

    const isSuccess = await handleGlobalSave(studySeconds)

    if (!isSuccess) {
      // 저장 실패 시 임시 기록 제거
      setDailyRecords((prev) =>
        prev.filter(
          (record) =>
            record._id !==
            newRecord._id
        )
      )

      setAlertMessage(
        "공부 기록 저장에 실패했습니다."
      )
    }

    return isSuccess
  }

  // 타이머 실행 중에는 과목 변경 차단
  const handleSubjectChange = (subject) => {
    if (isRunning) {
      setAlertMessage(
        "과목을 변경하려면 STOP 버튼을 눌러주세요."
      )
      return
    }

    setSelectedSubject(subject)
  }

  // 타이머 상단 상태 문구
  const getStudyMessage = () => {
    if (selectedSubject) {
      const subjectName =
        selectedSubject.subjectName ||
        selectedSubject

      return `${subjectName}이 선택되었습니다. 공부를 시작하세요!`
    }

    if (!userInfo) {
      return "유저 정보 불러오는 중..."
    }

    const streak =
      userInfo.currentStreak || 0

    const userName =
      userInfo.nickname || "회원"

    if (streak === 0) {
      return `${userName}님, 공부를 시작하세요!`
    }

    return `${streak}일째 공부중, 이어나가세요!`
  }

  return (
    <>
      <main className="app-page app-page--fixed">
        <div
          className={`app-page__inner ${styles.homeInner}`}
        >
          <header className="app-page-header">
            <div>
              <h1 className="app-page-title">
                홈
              </h1>

              <p className="app-page-description">
                오늘의 학습을
                계획하고 기록해
                보세요.
              </p>
            </div>
          </header>

          <div
            className={
              styles.homeContent
            }
          >
            {/* 상단: 타이머 + 과목 */}
            <div
              className={`${styles.homeRow} ${styles.topRow}`}
            >
              <section
                className={`commonSection ${styles.timerSection}`}
              >
                <Timer
                  selectedSubject={
                    selectedSubject
                  }
                  onSaveTime={
                    handleSaveRecord
                  }
                  userInfo={
                    userInfo
                  }
                  dailyRecords={
                    dailyRecords
                  }
                  time={time}
                  setTime={
                    setTime
                  }
                  isRunning={
                    isRunning
                  }
                  setIsRunning={
                    setIsRunning
                  }
                  actualStartTime={
                    actualStartTime
                  }
                  setActualStartTime={
                    setActualStartTime
                  }
                  studyMessage={
                    getStudyMessage()
                  }
                />
              </section>

              <section
                className={`commonSection ${styles.subjectSection}`}
              >
                <div
                  className={
                    styles.subjectContent
                  }
                >
                  <SubjectList
                    subjects={
                      subjects
                    }
                    dailyRecords={
                      dailyRecords
                    }
                    selectedSubject={
                      selectedSubject
                    }
                    onSelectSubject={
                      handleSubjectChange
                    }
                  />
                </div>
              </section>
            </div>

            {/* 하단: Todo + 캘린더 */}
            <div
              className={`${styles.homeRow} ${styles.bottomRow}`}
            >
              <section
                className={`commonSection ${styles.todoSection}`}
              >
                <TodoList />
              </section>

              <section
                className={`commonSection ${styles.calendarSection}`}
              >
                <HomeCalendar />
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* 홈 공통 알림 모달 */}
      {alertMessage && (
        <div
          className={
            styles.alertOverlay
          }
          role="presentation"
        >
          <section
            className={
              styles.alertBox
            }
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="home-alert-title"
          >
            <div
              className={
                styles.alertHeader
              }
            >
              <strong
                id="home-alert-title"
              >
                알림
              </strong>

              <button
                type="button"
                className={
                  styles.alertCloseButton
                }
                onClick={() =>
                  setAlertMessage(
                    ""
                  )
                }
                aria-label="알림 닫기"
              >
                ✕
              </button>
            </div>

            <p
              className={
                styles.alertMessage
              }
            >
              {alertMessage}
            </p>
          </section>
        </div>
      )}
    </>
  )
}