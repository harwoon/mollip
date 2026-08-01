import styles from "./GroupGoalItem.module.css"

const GOAL_LABELS = {
    MIN_STUDY_TIME: "주간 최소 공부시간",
    CHALLENGE_STUDY_TIME: "주간 도전 공부시간",
    TODO_COMPLETION_RATE: "개인 Todo 학습률",
    ATTENDANCE_DAYS: "주간 출석일"
}

function formatNumber(value) {
    const numberValue = Number(value) || 0

    if (Number.isInteger(numberValue)) {
        return String(numberValue)
    }

    return numberValue
        .toFixed(2)
        .replace(/\.?0+$/, "")
}

/*
 * 시간(float)을 "0시간 00분" 형식으로 변환
 * 예)
 * 0.18 -> 0시간 11분
 * 1    -> 1시간 00분
 * 2.5  -> 2시간 30분
 */
function formatHourMinute(hourValue) {
    const safeHourValue = Math.max(Number(hourValue) || 0, 0)

    const totalMinutes = Math.round(safeHourValue * 60)

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}시간 ${String(minutes).padStart(2, "0")}분`
}

// 현재값 표시
function formatCurrentValue(value, unit) {
    switch (unit) {
        case "HOUR":
            return formatHourMinute(value)

        case "PERCENT":
            return `${formatNumber(value)}%`

        case "DAY":
            return `${formatNumber(value)}일`

        default:
            return formatNumber(value)
    }
}

// 목표값 표시
function formatTargetValue(value, unit) {
    switch (unit) {
        case "HOUR":
            return `${formatNumber(value)}시간`

        case "PERCENT":
            return `${formatNumber(value)}%`

        case "DAY":
            return `${formatNumber(value)}일`

        default:
            return formatNumber(value)
    }
}


export default function GroupGoalItem({
    goal,
    color = "#dd6262"
}) {
    const safeProgressRate = Math.min(
        Math.max(Number(goal.progressRate) || 0, 0),
        100
    )

    const goalTitle =
        GOAL_LABELS[goal.goalType] || goal.goalType

    return (
        <article
            className={styles.item}
            style={{
                "--goal-color": color
            }}
        >
            <div className={styles.content}>
                <div className={styles.titleArea}>
                    <span
                        className={`
                            ${styles.checkBox}
                            ${goal.isAchieved
                                ? styles.checked
                                : ""
                            }
                        `}
                        aria-label={
                            goal.isAchieved
                                ? "목표 달성"
                                : "목표 미달성"
                        }
                    >
                        {goal.isAchieved && "✓"}
                    </span>

                    <span
                        className={styles.title}
                        title={goalTitle}
                    >
                        {goalTitle}
                    </span>
                </div>

                <strong className={styles.value}>
                    <span className={styles.currentValue}>
                        {formatCurrentValue(
                            goal.currentValue,
                            goal.unit
                        )}
                    </span>

                    <span className={styles.divider}>
                        {" / "}
                    </span>

                    <span>
                        {formatTargetValue(
                            goal.targetValue,
                            goal.unit
                        )}
                    </span>
                </strong>
            </div>

            <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label={`${goalTitle} 진행률`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={safeProgressRate}
            >
                <div
                    className={styles.progressFill}
                    style={{
                        width: `${safeProgressRate}%`
                    }}
                />
            </div>
        </article>
    )
}