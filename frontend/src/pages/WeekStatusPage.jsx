import React, { useState } from "react";

import WeeklyStudyTimeChart from "../features/weekly/components/WeeklyStudyTimeChart.jsx";
import SubjectStudyTimeChart from "../features/weekly/components/SubjectStudyTimeChart.jsx";
import GoalAchievementChart from "../features/weekly/components/GoalAchievementChart.jsx";
import GroupStreakChart from '../features/weekly/components/GroupStreakChart.jsx'
import GroupWeeklyStudyChart from "../features/weekly/components/GroupWeeklyStudyChart.jsx"
import GroupRanking from "../features/weekly/components/GroupRanking.jsx"

const DEFAULT_GROUP_ID = "6a671438ab632542fc161df7"

export default function WeekStatusPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const groupId = localStorage.getItem("groupId")

  const hasGroup = groupId && groupId !== DEFAULT_GROUP_ID

  return (
    <main className="weekStatusPage">
      {/* 개인 통계 */}
      <section className="personalStatistics">
        <h2>개인 통계</h2>
        <div className="statisticsGrid">
          <WeeklyStudyTimeChart selectedDate={selectedDate} />
          <SubjectStudyTimeChart selectedDate={selectedDate} />
          <GoalAchievementChart selectedDate={selectedDate} />
        </div>
      </section>
      {/* 휴면 그룹이 아닐 때만 그룹 영역 전체 표시 */}
      {hasGroup && (
        <>
          {/* 그룹 통계 */}
          <section className="groupStatistics">
            <h2>그룹 통계</h2>
            <div className="statisticsGrid">
              <GroupStreakChart selectedDate={selectedDate} />
              <GroupWeeklyStudyChart selectedDate={selectedDate} />
            </div>
          </section>
        </>
      )}
      {/* 그룹 내 랭킹 */}
      <section className="groupRanking">
        <h2>그룹 내 랭킹 순위</h2>
        <GroupRanking selectedDate={selectedDate}/>
      </section>
    </main>
  );
}
