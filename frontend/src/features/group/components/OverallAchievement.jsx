import styles from "./OverallAchievement.module.css"

export default function OverallAchievement({
    achievementRate = 0,
    color = "#E15E63"
}) {
    /*
     * 서버에서 잘못된 값이 오더라도
     * 0~100 사이로 제한
     */
    const safeRate = Math.min(
        Math.max(Number(achievementRate) || 0, 0),
        100
    )

    /*
     * conic-gradient에서는
     * 100% = 360도
     */
    const progressDegree = safeRate * 3.6

    return (
        <div className={styles.achievement}>
            <div
                className={styles.chart}
                style={{
                    "--progress-degree": `${progressDegree}deg`,
                    "--achievement-color": color
                }}
            >
                <div className={styles.chartInner}>
                    <span className={styles.label}>
                        전체 달성률
                    </span>

                    <strong className={styles.rate}>
                        {Math.round(safeRate)}%
                    </strong>
                </div>
            </div>
        </div>
    )
}