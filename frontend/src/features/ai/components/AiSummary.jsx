// 서진
// diagnosis.summary: 최근 학습 패턴에 대한 1~2줄 총평
// diagnosis.immersionScore: 몰입도
import { RiDoubleQuotesL, RiSparklingFill } from "react-icons/ri"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { getChartTheme } from "../../../../util/chartTheme.js"

import styles from "./AiSummary.module.css"

export default function AiSummary({ diagnosis }) {
    const score = diagnosis.immersionScore
    const theme = getChartTheme()

    // 과목별 차트처럼 배열 형태로 데이터 구성 - "달성" + "남은 부분" 2조각
    const chartData = [
        { name: "달성", value: score, fill: theme.colors.primary },
        { name: "남은 부분", value: 100 - score, fill: theme.colors.primaryLight }
    ]

    return (
        <section className={styles.summary}>
            <div className={styles.coachVisual}>
                <img
                    className={styles.coachImage}
                    src="/images/aireport.png"
                    alt="Mollip AI 코치"
                />
            </div>

            <div className={styles.coachMessage}>
                <div className={styles.coachHeading}>
                    <RiSparklingFill aria-hidden="true" />
                    <span>AI 코치의 한마디</span>
                </div>

                <div className={styles.quoteArea}>
                    <RiDoubleQuotesL
                        className={styles.quoteIcon}
                        aria-hidden="true"
                    />
                    <p className={styles.summaryText}>
                        {diagnosis.summary}
                    </p>
                </div>
            </div>

            <div className={styles.scoreArea}>
                <div className={styles.chartArea}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={58}
                                outerRadius={78}
                                startAngle={90}
                                endAngle={-270}
                                stroke="none"
                                isAnimationActive={true}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className={styles.centerLabel}>
                        <span className={styles.immersionLabel}>이번 주 몰입도</span>
                        <strong className={styles.immersionScore}>
                            {diagnosis.immersionScore}%
                        </strong>
                    </div>
                </div>
            </div>
        </section>
    )
}
