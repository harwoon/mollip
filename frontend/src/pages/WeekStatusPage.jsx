import { useEffect, useState } from "react";

import WeeklyStudyTimeChart from "../features/weekly/components/WeeklyStudyTimeChart";
import { getWeeklyStudyTime } from "../features/weekly/api/weekly";

export default function WeekStatusPage() {
  const [weeklyStudyData, setWeeklyStudyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeeklyStudyTime = async () => {
      try {
        setLoading(true);
        setError("");

        const chartData = await getWeeklyStudyTime();

        console.log("차트 데이터:", chartData);

        setWeeklyStudyData(chartData);
      } catch (error) {
        console.error("주간 공부 기록 조회 실패:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyStudyTime();
  }, []);

  if (loading) {
    return <p>주간 공부 기록을 불러오는 중...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h2>개인 통계</h2>

      <WeeklyStudyTimeChart data={weeklyStudyData} />
    </main>
  );
}