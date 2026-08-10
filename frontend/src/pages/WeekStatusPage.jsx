import { useState } from "react";

import WeeklyStudyTimeChart from "../features/weekly/components/WeeklyStudyTimeChart.jsx";
import SubjectStudyTimeChart from "../features/weekly/components/SubjectStudyTimeChart.jsx";
import GoalAchievementChart from "../features/weekly/components/GoalAchievementChart.jsx";
import GroupStreakChart from "../features/weekly/components/GroupStreakChart.jsx";
import GroupWeeklyStudyChart from "../features/weekly/components/GroupWeeklyStudyChart.jsx";
import GroupRanking from "../features/weekly/components/GroupRanking.jsx";
import GroupTodoAchievementChart from "../features/weekly/components/GroupTodoAchievementChart.jsx";

import styles from "./WeekStatusPage.module.css";

const DEFAULT_GROUP_ID = "6a671438ab632542fc161df7";

export default function WeekStatusPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const groupId = localStorage.getItem("groupId");

    const hasGroup = groupId && groupId !== DEFAULT_GROUP_ID;

    return (
        <div className="app-page app-page--fixed">
        <main className={`app-page__inner ${styles.page}`}>
            {/* 개인 통계 */}
            <section className={styles.statisticsSection}>
            <h2 className={styles.sectionTitle}>개인 통계</h2>

            <div className={styles.statisticsPanel}>
                <WeeklyStudyTimeChart selectedDate={selectedDate} />

                <SubjectStudyTimeChart selectedDate={selectedDate} />

                <GoalAchievementChart selectedDate={selectedDate} />
            </div>
            </section>

            {/* 휴면 그룹이 아닐 때만 그룹 영역 전체 표시 */}
            {hasGroup && (
            <section className={styles.statisticsSection}>
                <h2 className={styles.sectionTitle}>그룹 통계</h2>

                <div className={styles.statisticsPanel}>
                <GroupWeeklyStudyChart selectedDate={selectedDate} />

                <GroupStreakChart selectedDate={selectedDate} />

                <GroupTodoAchievementChart selectedDate={selectedDate} />
                </div>
            </section>
            )}

            {/* 그룹 내 랭킹 */}
            <section className={styles.rankingSection}>
            <h2 className={styles.sectionTitle}>그룹 내 랭킹 순위</h2>

            <div className={styles.rankingPanel}>
                <GroupRanking selectedDate={selectedDate} />
            </div>
            </section>
        </main>
        </div>
    )
}
