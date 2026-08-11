const GOAL_LABELS = {
    MIN_STUDY_TIME: "주간 최소 공부시간",
    CHALLENGE_STUDY_TIME: "주간 도전 공부시간",
    TODO_COMPLETION_RATE: "개인 Todo 달성률",
    ATTENDANCE_DAYS: "주간 출석일"
}


function toSafeNumber(value) {
    const numberValue = Number(value)

    return Number.isFinite(numberValue)
        ? Math.max(numberValue, 0)
        : 0
}


function clampProgress(value) {
    return Math.min(toSafeNumber(value), 100)
}


function formatNumber(value) {
    const numberValue = toSafeNumber(value)

    if (Number.isInteger(numberValue)) {
        return String(numberValue)
    }

    return numberValue
        .toFixed(2)
        .replace(/\.?0+$/, "")
}


function formatHourMinute(value) {
    const totalMinutes = Math.round(toSafeNumber(value) * 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}시간 ${String(minutes).padStart(2, "0")}분`
}


export function formatGoalValue(
    value,
    unit,
    { isTarget = false } = {}
) {
    switch (unit) {
        case "HOUR":
            return isTarget
                ? `${formatNumber(value)}시간`
                : formatHourMinute(value)

        case "PERCENT":
            return `${formatNumber(value)}%`

        case "DAY":
            return `${formatNumber(value)}일`

        default:
            return formatNumber(value)
    }
}


export function buildGoalProgressRows(goals = []) {
    if (!Array.isArray(goals)) {
        return []
    }

    return goals.map((goal) => {
        const progressRate = clampProgress(goal?.progressRate)
        const progressPrefix = goal?.unit === "HOUR" ? "약 " : ""

        return {
            goalType: goal?.goalType,
            label: GOAL_LABELS[goal?.goalType] || goal?.goalType || "그룹 목표",
            currentTargetText: `${formatGoalValue(
                goal?.currentValue,
                goal?.unit
            )} / ${formatGoalValue(
                goal?.targetValue,
                goal?.unit,
                { isTarget: true }
            )}`,
            progressRate,
            progressText: `${progressPrefix}${formatNumber(progressRate)}%`
        }
    })
}


export function buildOverallProgressSummary(
    goals = [],
    overallAchievementRate = 0
) {
    const safeGoals = Array.isArray(goals) ? goals : []
    const progressRates = safeGoals.map((goal) =>
        clampProgress(goal?.progressRate)
    )
    const preciseRate = clampProgress(overallAchievementRate)

    return {
        progressExpression: progressRates
            .map(formatNumber)
            .join(" + "),
        divisor: progressRates.length,
        preciseRate,
        displayedRate: Math.round(preciseRate)
    }
}
