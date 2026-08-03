import { useOutletContext } from "react-router-dom"
import React, { useState, useEffect } from "react"
import Timer from "../features/home/components/Timer"
import TodoList from "../features/home/components/TodoList"
import HomeCalendar from "../features/home/components/HomeCalendar"
import SubjectList from "../features/home/components/SubjectList"
import { getMyInfo } from "../features/auth/api/auth"

import styles from "./HomePage.module.css"

const API_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://127.0.0.1:3000'

// 마이페이지에서 저장한 과목 순서를 홈 화면에도 적용
function applySavedSubjectOrder(subjectList) {
    const userId = localStorage.getItem("userId") || "unknown"
    const storageKey = `mollip-subject-order-${userId}`
    const savedOrderText = localStorage.getItem(storageKey)

    // 저장된 과목 순서가 없으면 서버에서 받은 순서를 그대로 사용
    if (!savedOrderText) {
        return subjectList
    }

    try {
        const savedSubjectIds = JSON.parse(savedOrderText)

        // 저장된 값이 배열이 아니라면 서버 순서를 그대로 사용
        if (!Array.isArray(savedSubjectIds)) {
            return subjectList
        }

        // 과목 ID를 기준으로 과목 객체를 찾기 위한 Map
        const subjectMap = new Map(
            subjectList.map((subject) => [
                subject._id,
                subject
            ])
        )

        // localStorage에 저장된 ID 순서대로 과목 배치
        const orderedSubjects =
            savedSubjectIds
                .map((subjectId) => subjectMap.get(subjectId))
                .filter(Boolean)

        // 순서 저장 후 새롭게 추가된 과목은 마지막에 배치
        const unorderedSubjects =
            subjectList.filter(
                (subject) => !savedSubjectIds.includes(subject._id)
            )

        return [
            ...orderedSubjects,
            ...unorderedSubjects
        ]
    } catch (error) {
        console.error("홈 과목 순서 적용 실패:", error)
        return subjectList
    }
}

export default function HomePage() {
    const { selectedSubject, setSelectedSubject, time, setTime, isRunning, setIsRunning, actualStartTime, setActualStartTime } = useOutletContext()
    const [subjects, setSubjects] = useState([])
    const [dailyRecords, setDailyRecords] = useState([])

    const [userInfo, setUserInfo] = useState(null)
    const userToken = localStorage.getItem("token")

    const [alertMessage, setAlertMessage] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getMyInfo()
                setUserInfo(userData.user)

                const kstOffset = new Date().getTimezoneOffset() * 60000
                const todayKST = new Date(Date.now() - kstOffset).toISOString().split('T')[0]

                // 과목 조회
                const subjectRes = await fetch(`${API_URL}/auth/subject`, {
                    headers: { Authorization: `Bearer ${userToken}` },
                })

                if (subjectRes.ok) {
                    const subjectData = await subjectRes.json()
                    let finalSubjects = []
                    
                    if (Array.isArray(subjectData)) {
                        finalSubjects = subjectData
                    } else if (subjectData && typeof subjectData === "object") {
                        const arrayKey = Object.keys(subjectData).find((key) => Array.isArray(subjectData[key]))
                        if (arrayKey) finalSubjects = subjectData[arrayKey]
                        else if (subjectData.subjectName) finalSubjects = [subjectData]
                    }
                    
                    // 서버에서 받은 과목에 마이페이지에서 저장한 순서를 적용
                    const orderedSubjects = applySavedSubjectOrder(finalSubjects)
                    setSubjects(orderedSubjects)
                }

                // 일일 기록 조회
                const recordRes = await fetch(`${API_URL}/study/records?type=daily&date=${todayKST}`, {
                    headers: { Authorization: `Bearer ${userToken}` },
                })

                if (recordRes.ok) {
                    const recordData = await recordRes.json()
                    let finalRecords = []
                    
                    if (Array.isArray(recordData)) {
                        finalRecords = recordData
                    } else if (recordData && typeof recordData === "object") {
                        const arrayKey = Object.keys(recordData).find((key) => Array.isArray(recordData[key]))
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
            sumStudyTime: studySeconds,
        }

        setDailyRecords((prev) => [...prev, newRecord])

        try {
            const kstOffset = new Date().getTimezoneOffset() * 60000
            const todayString = new Date(actualStartTime.getTime() - kstOffset).toISOString().split("T")[0]

            const response = await fetch(`${API_URL}/study/addStudy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    studyTitle: selectedSubject.subjectName,
                    studyDate: todayString,
                    startTime: actualStartTime.toISOString(),
                    endTime: actualEndTime.toISOString(),
                    sumStudyTime: studySeconds,
                }),
            })

            if (!response.ok) throw new Error("서버 저장 실패")
            return true
        } catch (error) {
            console.error("저장 에러:", error)
            setDailyRecords((prev) => prev.filter((record) => record._id !== newRecord._id))
            return false
        }
    }

    const handleSubjectChange = (subject) => {
        if (isRunning) {
            setAlertMessage("과목을 변경하려면 STOP을 눌러주세요!!")
            return
        }
        setSelectedSubject(subject)
    }

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '30px', height: '100%', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ flex: 6.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <Timer
                        selectedSubject={selectedSubject}
                        onSaveTime={handleSaveRecord}
                        userInfo={userInfo}
                        dailyRecords={dailyRecords}
                        time={time}
                        setTime={setTime}
                        isRunning={isRunning}
                        setIsRunning={setIsRunning}
                        actualStartTime={actualStartTime}
                        setActualStartTime={setActualStartTime}
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
                        onSelectSubject={handleSubjectChange}
                    />
                </div>
                <div>
                    <HomeCalendar />
                </div>
            </div>

            {alertMessage && (
                <div className={styles.alertOverlay}>
                    <div className={styles.alertBox}>
                        <div className={styles.alertHeader}>
                            <strong>알림</strong>
                            <button type="button" className={styles.alertCloseButton} onClick={() => setAlertMessage(null)}>✕</button>
                        </div>
                        <p className={styles.alertMessage}>{alertMessage}</p>
                    </div>
                </div>
            )}
        </div>
    )
}