const GOAL_LABELS = {
  MIN_STUDY_TIME: "주간 최소 공부시간",
  CHALLENGE_STUDY_TIME: "주간 도전 공부시간",
  TODO_COMPLETION_RATE: "개인 Todo 학습률",
  ATTENDANCE_DAYS: "주간 출석일",
};

/*
 * 목표 단위에 맞게 숫자 표시
 */
function formatGoalValue(value, unit) {
  if (unit === "HOUR") {
    return `${value}시간`;
  }

  if (unit === "PERCENT") {
    return `${value}%`;
  }

  if (unit === "DAY") {
    return `${value}일`;
  }

  return value;
}

/*
 * 목표 제목 만들기
 */
function getGoalTitle(goal) {
  const label = GOAL_LABELS[goal.goalType] || "그룹 목표";

  if (goal.goalType === "MIN_STUDY_TIME") {
    return `${label} ${goal.targetValue}시간 달성`;
  }

  if (goal.goalType === "CHALLENGE_STUDY_TIME") {
    return `${label} ${goal.targetValue}시간 달성`;
  }

  if (goal.goalType === "TODO_COMPLETION_RATE") {
    return `${label} ${goal.targetValue}% 이상 달성`;
  }

  if (goal.goalType === "ATTENDANCE_DAYS") {
    return `${label} ${goal.targetValue}일 이상 달성`;
  }

  return label;
}

export default function GroupGoalItem({ goal }) {
  const { currentValue, targetValue, unit, achievementRate, completed } = goal;

  return (
    <div className="groupGoalItem">
      <div className="groupGoalItemTop">
        <div className="groupGoalTitleArea">
          <span
            className={completed ? "goalCheckbox completed" : "goalCheckbox"}
          >
            {completed ? "✓" : ""}
          </span>

          <span className="groupGoalTitle">{getGoalTitle(goal)}</span>
        </div>

        <span className="groupGoalValue">
          {formatGoalValue(currentValue, unit)}
          {" / "}
          {formatGoalValue(targetValue, unit)}
        </span>
      </div>

      <div className="groupGoalProgressTrack">
        <div
          className="groupGoalProgressBar"
          style={{
            width: `${achievementRate}%`,
          }}
        />
      </div>
    </div>
  );
}
