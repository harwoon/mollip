import React, { useState } from "react";

import WeeklyStudyTimeChart from "../features/weekly/components/WeeklyStudyTimeChart.jsx";
import SubjectStudyTimeChart from "../features/weekly/components/SubjectStudyTimeChart.jsx";
import GoalAchievementChart from "../features/weekly/components/GoalAchievementChart.jsx";

export default function WeekStatusPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div>
      <div>
        <h2>주간 통계</h2>
      </div>
      <WeeklyStudyTimeChart selectedDate={selectedDate} />
      <SubjectStudyTimeChart selectedDate={selectedDate} />
      <GoalAchievementChart selectedDate={selectedDate} />
    </div>
  );
}
