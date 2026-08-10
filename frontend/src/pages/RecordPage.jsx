import { useState } from "react";
import TotalStudy from "../features/record/components/TotalStudy.jsx";
import TabSelector from "../features/record/components/TabSelector.jsx";
import DateSelector from "../features/record/components/DateSelector.jsx";
import TotalSubject from "../features/record/components/TotalSubject.jsx";
import BarSubject from "../features/record/components/BarSubject.jsx";
import LongestStudy from "../features/record/components/LongestStudy.jsx";
import HitCalendar from "../features/record/components/HitCalendar.jsx";
import Todo from "../features/record/components/Todo.jsx";

import styles from "./RecordPage.module.css";

export default function RecordPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [recordType, setRecordType] = useState("daily");

    return (
        <main className="app-page app-page--fixed">
            <div className={`app-page__inner ${styles.recordPage}`}>
                {/* 페이지 상단 */}
                <header className={styles.pageHeader}>
                    <div className={styles.headerLeft}>
                        <h1 className="app-page-title">내 공부 기록</h1>
                        <TabSelector
                            currentType={recordType}
                            onChangeType={setRecordType}
                        />
                    </div>

                    <DateSelector
                        selectedDate={selectedDate}
                        onChangeDate={setSelectedDate}
                        type={recordType}
                    />
                </header>

                {/* 기록 페이지 본문 */}
                <div className={styles.recordBody}>
                    {/* 왼쪽: 요약 + 그래프 */}
                    <div className={styles.mainArea}>
                        {/* 요약 카드 3개 */}
                        <div className={styles.summaryRow}>
                            <TotalStudy
                                selectedDate={selectedDate}
                                type={recordType}
                            />

                            <TotalSubject
                                selectedDate={selectedDate}
                                type={recordType}
                            />

                            <LongestStudy
                                selectedDate={selectedDate}
                                type={recordType}
                            />
                        </div>

                        {/* 막대그래프 + 히트맵 */}
                        <div className={styles.chartRow}>
                            <div className={styles.barArea}>
                                <BarSubject
                                    selectedDate={selectedDate}
                                    type={recordType}
                                />
                            </div>

                            <div className={styles.heatmapArea}>
                                <HitCalendar
                                    selectedDate={selectedDate}
                                    onChangeDate={setSelectedDate}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 목표 달성률 + Past List */}
                    <aside className={styles.todoArea}>
                        <Todo
                            selectedDate={selectedDate}
                            type={recordType}
                        />
                    </aside>
                </div>
            </div>
        </main>
    )
}