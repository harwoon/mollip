import { useOutletContext } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Timer from "../features/home/components/Timer";
import TodoList from "../features/home/components/TodoList";
import HomeCalendar from "../features/home/components/HomeCalendar";
import SubjectList from "../features/home/components/SubjectList";
import { getMyInfo } from "../features/auth/api/auth";

import styles from "./HomePage.module.css";

const API_URL = import.meta.env.VITE_LOCAL_API_URL

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
    const {
        selectedSubject,
        setSelectedSubject,
        time,
        setTime,
        isRunning,
        setIsRunning,
        actualStartTime,
        setActualStartTime,
    } = useOutletContext();
    const [subjects, setSubjects] = useState([]);
    const [dailyRecords, setDailyRecords] = useState([]);

    const [userInfo, setUserInfo] = useState(null);
    const userToken = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
        try {
            const userData = await getMyInfo();
            setUserInfo(userData.user);

            const kstOffset = new Date().getTimezoneOffset() * 60000;
            const todayKST = new Date(Date.now() - kstOffset)
            .toISOString()
            .split("T")[0];

            const subjectRes = await fetch(`${API_URL}/auth/subject`, {
            headers: { Authorization: `Bearer ${userToken}` },
            });

            if (subjectRes.ok) {
                const subjectData = await subjectRes.json()

                let finalSubjects = []

                if (Array.isArray(subjectData)) finalSubjects = subjectData
                else if (subjectData && typeof subjectData === "object") {
                    const arrayKey = Object.keys(subjectData)
                    .find(
                        (key) => Array.isArray(subjectData[key]),
                    )
                    if (arrayKey) finalSubjects = subjectData[arrayKey]
                    else if (subjectData.subjectName) finalSubjects = [subjectData]
                }
                // 서버에서 받은 과목에
                // 마이페이지에서 저장한 순서를 적용
                const orderedSubjects = applySavedSubjectOrder(finalSubjects)
                setSubjects(orderedSubjects)
            }

            const recordRes = await fetch(
            `${API_URL}/study/records?type=daily&date=${todayKST}`,
            {
                headers: { Authorization: `Bearer ${userToken}` },
            },
            );

            if (recordRes.ok) {
            const recordData = await recordRes.json();
            let finalRecords = [];
            if (Array.isArray(recordData)) finalRecords = recordData;
            else if (recordData && typeof recordData === "object") {
                const arrayKey = Object.keys(recordData).find((key) =>
                Array.isArray(recordData[key]),
                );
                if (arrayKey) finalRecords = recordData[arrayKey];
            }
            setDailyRecords(finalRecords);
            }
        } catch (error) {
            console.error("데이터 불러오기 실패:", error);
        }
        };
        fetchData();
    }, []);

    const handleSaveRecord = async (
        studySeconds,
        actualStartTime,
        actualEndTime,
    ) => {
        if (!selectedSubject) return false;

        const newRecord = {
        _id: `temp_${Date.now()}`,
        studyTitle: selectedSubject.subjectName,
        // startTime: actualStartTime.toISOString(),
        // endTime: actualEndTime.toISOString()
        sumStudyTime: studySeconds,
        };

        setDailyRecords((prev) => [...prev, newRecord]);

        try {
        const kstOffset = new Date().getTimezoneOffset() * 60000;
        const todayString = new Date(actualStartTime.getTime() - kstOffset)
            .toISOString()
            .split("T")[0];

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
        });

        if (!response.ok) throw new Error("서버 저장 실패");
        return true;
        } catch (error) {
        console.error("저장 에러:", error);
        setDailyRecords((prev) =>
            prev.filter((record) => record._id !== newRecord._id),
        );
        return false;
        }
    };

    // 타이머 상단 상태에 따라 문구 변경
    const getStudyMessage = () => {
        if (selectedSubject) {
        const subjectName = selectedSubject.subjectName || selectedSubject;
        return `${subjectName}이 선택되었습니다. 공부를 시작하세요!`;
        }

        if (!userInfo) {
        return "유저 정보 불러오는 중...";
        }

        const streak = userInfo.currentStreak || 0;
        const userName = userInfo.nickname || "회원";

        if (streak === 0) {
        return `${userName}님, 공부를 시작하세요!`;
        }
        return `${streak}일째 공부중, 이어나가세요!`;
    }

    return (
        <main className="app-page app-page--fixed">
            <div className={`app-page__inner ${styles.homeInner}`}>
                <header className="app-page-header">
                    <div>
                        <h1 className="app-page-title">
                            홈
                        </h1>

                        <p className="app-page-description">
                            오늘의 학습을 계획하고 기록해 보세요.
                        </p>
                    </div>
                </header>

                <div className={styles.homeContent}>
                    {/* 상단: 타이머 + 과목 */}
                    <div className={`${styles.homeRow} ${styles.topRow}`} >
                        <section className={`commonSection ${styles.timerSection}`}>
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
                                studyMessage={getStudyMessage()}
                            />
                        </section>

                        <section className={`commonSection ${styles.subjectSection}`}>
                            <div className={styles.subjectContent}>
                                <SubjectList
                                    subjects={subjects}
                                    dailyRecords={dailyRecords}
                                    selectedSubject={selectedSubject}
                                    onSelectSubject={(subject) => {
                                        if (isRunning) return

                                        setSelectedSubject(subject)
                                    }}
                                />
                            </div>
                        </section>
                    </div>

                    {/* 하단: Todo + 캘린더 */}
                    <div className={`${styles.homeRow} ${styles.bottomRow}`}>
                        <section className={`commonSection ${styles.todoSection}`}>
                            <TodoList />
                        </section>

                        <section className={`commonSection ${styles.calendarSection}`}>
                            <HomeCalendar />
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}