// 서진
// diagnosis.summary: 최근 학습 패턴에 대한 1~2줄 총평
// diagnosis.immersionScore: 몰입도

import { RiSparklingFill } from "react-icons/ri"
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
        <section>
            <div>
                <RiSparklingFill />
                <h3>AI 몰입 코치</h3>
            </div>
            <img src="../../../../public/images/aireport.png" />

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

                {/* 도넛 차트 가운데 오늘의 몰입도 */}
                <div className={styles.centerLabel}>
                    <span className={styles.immersionLabel}>오늘의 몰입도</span>
                    <strong className={styles.immersionScore}>
                        {diagnosis.immersionScore}%
                    </strong>
                </div>
            </div>

            <div>
                <h3>AI 종합 진단</h3>
                <p>{diagnosis.summary}</p>
            </div>
        </section>
    )
}