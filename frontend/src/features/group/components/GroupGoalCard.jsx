import { useEffect, useMemo, useState } from "react";

import { getMyGroupGoals } from "../api/groupGoal";
import GroupGoalItem from "./GroupGoalItem";
import "./GroupGoalCard.css";

/*
 * 달성률 계산
 *
 * 100%를 초과하지 않도록 제한
 */
function calculateAchievementRate(currentValue, targetValue) {
  if (!targetValue || targetValue <= 0) {
    return 0;
  }

  return Math.min(Math.round((currentValue / targetValue) * 100), 100);
}

/*
 * 분을 시간과 분으로 표시
 */
function formatMinutes(minutes) {
  const safeMinutes = Math.max(Number(minutes) || 0, 0);

  const hours = Math.floor(safeMinutes / 60);

  const remainMinutes = safeMinutes % 60;

  if (hours === 0) {
    return `${remainMinutes}분`;
  }

  if (remainMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainMinutes}분`;
}

export default function GroupGoalCard() {
  const [groupGoalData, setGroupGoalData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * 그룹 목표와 개인 주간 기록 조회
   */
  useEffect(() => {
    async function fetchGroupGoals() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyGroupGoals();

        setGroupGoalData(data);
      } catch (error) {
        console.error("그룹 목표 조회 실패:", error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGroupGoals();
  }, []);

  /*
   * 목표별 현재 수치와 달성률 계산
   */
  const calculatedGoals = useMemo(() => {
    if (!groupGoalData) {
      return [];
    }

    const {
      goals = [],
      weeklyStudyMinutes = 0,
      todoCompletionRate = 0,
      attendanceDays = 0,
    } = groupGoalData;

    /*
     * 분 단위 공부시간을
     * 시간 단위로 변환
     */
    const weeklyStudyHours = Number((weeklyStudyMinutes / 3600).toFixed(1));

    return [...goals]
      .sort((first, second) => first.order - second.order)
      .map((goal) => {
        let currentValue = 0;

        if (
          goal.goalType === "MIN_STUDY_TIME" ||
          goal.goalType === "CHALLENGE_STUDY_TIME"
        ) {
          currentValue = weeklyStudyHours;
        }

        if (goal.goalType === "TODO_COMPLETION_RATE") {
          currentValue = Number(todoCompletionRate) || 0;
        }

        if (goal.goalType === "ATTENDANCE_DAYS") {
          currentValue = Number(attendanceDays) || 0;
        }

        const achievementRate = calculateAchievementRate(
          currentValue,
          goal.targetValue,
        );

        return {
          ...goal,
          currentValue,
          achievementRate,
          completed: currentValue >= goal.targetValue,
        };
      });
  }, [groupGoalData]);

  /*
   * 목표 4개의 평균 달성률
   */
  const totalAchievementRate = useMemo(() => {
    if (!calculatedGoals.length) {
      return 0;
    }

    const total = calculatedGoals.reduce(
      (sum, goal) => sum + goal.achievementRate,
      0,
    );

    return Math.round(total / calculatedGoals.length);
  }, [calculatedGoals]);

  /*
   * 도전 공부시간 목표까지 남은 시간
   */
  const remainingStudyMinutes = useMemo(() => {
    if (!groupGoalData) {
      return 0;
    }

    const challengeGoal = calculatedGoals.find(
      (goal) => goal.goalType === "CHALLENGE_STUDY_TIME",
    );

    if (!challengeGoal) {
      return 0;
    }

    const targetMinutes = challengeGoal.targetValue * 60;

    return Math.max(
      Math.round(targetMinutes - groupGoalData.weeklyStudyMinutes),
      0,
    );
  }, [calculatedGoals, groupGoalData]);

  if (loading) {
    return (
      <section className="groupGoalCard groupGoalState">
        그룹 목표를 불러오는 중입니다.
      </section>
    );
  }

  if (error) {
    return (
      <section className="groupGoalCard groupGoalState error">{error}</section>
    );
  }

  if (!groupGoalData?.group) {
    return (
      <section className="groupGoalCard groupGoalState">
        현재 배정된 그룹이 없습니다.
      </section>
    );
  }

  const groupColor = groupGoalData.group.groupColor || "#8064C6";

  return (
    <section
      className="groupGoalCard"
      style={{
        "--group-color": groupColor,
      }}
    >
      <header className="groupGoalHeader">
        <div className="groupGoalIcon">◎</div>

        <div>
          <h2>그룹별 목표</h2>

          <p>{groupGoalData.group.groupName}의 이번 주 목표</p>
        </div>
      </header>

      <div className="groupGoalContent">
        <div className="groupGoalList">
          {calculatedGoals.map((goal) => (
            <GroupGoalItem key={goal.goalType} goal={goal} />
          ))}
        </div>

        <div className="groupGoalSummary">
          <div
            className="achievementCircle"
            style={{
              "--achievement-rate": `${totalAchievementRate * 3.6}deg`,
            }}
          >
            <div className="achievementCircleInner">
              <span>전체 달성률</span>

              <strong>{totalAchievementRate}%</strong>
            </div>
          </div>

          <div className="remainingTimeBox">
            <span className="remainingTimeIcon">◷</span>

            <div>
              <span>남은 시간</span>

              <strong>{formatMinutes(remainingStudyMinutes)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
