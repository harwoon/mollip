// util/groupGoal.js

/**
 * 소수점 둘째 자리까지 반환
 */
function roundToTwo(value) {
  return Number(Number(value).toFixed(2));
}

/**
 * 목표 종류에 맞는 현재값을 반환
 *
 * 공부시간 목표는 그룹 목표가 시간 단위이므로
 * 초 단위 주간 공부시간을 시간으로 변환합니다.
 */
function getCurrentValueByGoalType(goalType, summary) {
  switch (goalType) {
    case "MIN_STUDY_TIME":
    case "CHALLENGE_STUDY_TIME":
      return (Number(summary.weeklyStudySeconds) || 0) / 3600;

    case "TODO_COMPLETION_RATE":
      return Number(summary.todoCompletionRate) || 0;

    case "ATTENDANCE_DAYS":
      return Number(summary.attendanceDays) || 0;

    default:
      throw new Error(`지원하지 않는 그룹 목표입니다: ${goalType}`);
  }
}

/**
 * 하나의 그룹 목표 진행률 계산
 */
export function calculateGoalProgress(goal, summary = {}) {
  if (!goal?.goalType) {
    throw new TypeError("목표 종류가 필요합니다.");
  }

  const targetValue = Math.max(
    Number(goal.targetValue) || 0,
    0,
  );

  const currentValue = Math.max(
    getCurrentValueByGoalType(goal.goalType, summary),
    0,
  );

  /*
   * 목표가 0인 경우:
   * Todo 목표 0%처럼 처음부터 충족된 목표로 처리
   */
  const progressRate =
    targetValue === 0
      ? 100
      : Math.min(
        (currentValue / targetValue) * 100,
        100,
      );

  return {
    goalType: goal.goalType,
    targetValue,
    currentValue: roundToTwo(currentValue),
    unit: goal.unit,
    order: goal.order,
    progressRate: roundToTwo(progressRate),
    isAchieved: currentValue >= targetValue,
  };
}

/**
 * 목표별 진행률 평균으로 전체 달성률 계산
 */
export function calculateOverallAchievementRate(
  calculatedGoals = [],
) {
  if (!Array.isArray(calculatedGoals)) {
    throw new TypeError("목표 목록은 배열이어야 합니다.");
  }

  if (calculatedGoals.length === 0) {
    return 0;
  }

  const totalProgressRate = calculatedGoals.reduce(
    (total, goal) => {
      const progressRate = Math.min(
        Math.max(Number(goal.progressRate) || 0, 0),
        100,
      );

      return total + progressRate;
    },
    0,
  );

  return roundToTwo(
    totalProgressRate / calculatedGoals.length,
  );
}

/**
 * 그룹 목표 전체 진행률과 전체 달성률 계산
 */
export function buildWeeklyGoalProgress(
  goals = [],
  summary = {},
) {
  const calculatedGoals = [...goals]
    .sort((a, b) => a.order - b.order)
    .map((goal) =>
      calculateGoalProgress(goal, summary),
    );

  return {
    goals: calculatedGoals,
    overallAchievementRate:
      calculateOverallAchievementRate(calculatedGoals),
  };
}

/**
 * 그룹 회원들의 평균 목표 달성률 계산
 *
 * memberSummaries 배열에는 활동 없는 회원도
 * 0값을 가진 객체로 반드시 포함되어야 한다.
 */
export function calculateAverageGoalAchievementRate(
  goals,
  memberSummaries
) {
  if (
    !Array.isArray(memberSummaries) ||
    memberSummaries.length === 0
  ) {
    return 0
  }

  const totalAchievementRate =
    memberSummaries.reduce(
      (total, summary) => {
        const {
          overallAchievementRate
        } = buildWeeklyGoalProgress(
          goals || [],
          {
            weeklyStudySeconds:
              Number(
                summary.weeklyStudySeconds
              ) || 0,

            todoCompletionRate:
              Number(
                summary.todoCompletionRate
              ) || 0,

            attendanceDays:
              Number(
                summary.attendanceDays
              ) || 0
          }
        )

        return (
          total +
          (
            Number(
              overallAchievementRate
            ) || 0
          )
        )
      },
      0
    )

  return roundToTwo(
    totalAchievementRate /
    memberSummaries.length
  )
}