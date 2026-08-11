import { FiInfo } from "react-icons/fi"

import AppModal from "../../../components/common/AppModal.jsx"
import {
    buildGoalProgressRows,
    buildOverallProgressSummary
} from "../util/groupGoalDisplay.js"

import styles from "./GroupGoalProgressInfoModal.module.css"


export default function GroupGoalProgressInfoModal({
    open = false,
    goals = [],
    overallAchievementRate = 0,
    color = "#dd6262",
    onClose
}) {
    const rows = buildGoalProgressRows(goals)
    const summary = buildOverallProgressSummary(
        goals,
        overallAchievementRate
    )

    return (
        <AppModal
            open={open}
            type="action"
            title="전체 달성률 계산 안내"
            description="각 목표의 진행률을 계산한 뒤 동일한 비중으로 평균을 구해요."
            icon={<FiInfo />}
            onClose={onClose}
            footer={(
                <button
                    type="button"
                    className="app-btn-primary"
                    onClick={onClose}
                >
                    확인
                </button>
            )}
        >
            <div
                className={styles.content}
                style={{ "--goal-info-color": color }}
            >
                <div className={styles.personalNotice}>
                    <FiInfo aria-hidden="true" />
                    <p>
                        이 달성률은 그룹 전체 평균이 아닌,
                        <strong> 현재 나의 진행률</strong>이에요.
                    </p>
                </div>

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">목표</th>
                                <th scope="col">현재 / 목표</th>
                                <th scope="col">개별 진행률</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.goalType}>
                                    <th scope="row" data-label="목표">
                                        {row.label}
                                    </th>
                                    <td data-label="현재 / 목표">
                                        {row.currentTargetText}
                                    </td>
                                    <td
                                        data-label="개별 진행률"
                                        className={styles.progressRate}
                                    >
                                        {row.progressText}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <section className={styles.formula}>
                    <span className={styles.formulaLabel}>
                        현재 전체 달성률
                    </span>
                    <p className={styles.formulaExpression}>
                        ({summary.progressExpression}) ÷ {summary.divisor}
                    </p>
                    <p className={styles.formulaResult}>
                        = {summary.preciseRate}%
                        <span> → {summary.displayedRate}%</span>
                    </p>
                </section>

                <ul className={styles.notes}>
                    <li>개별 진행률은 (현재값 ÷ 목표값) × 100으로 계산해요.</li>
                    <li>목표를 초과해도 최대 100%까지만 평균에 반영해요.</li>
                    <li>등록된 모든 목표는 동일한 비중으로 평균해요.</li>
                    <li>카드의 전체 달성률은 소수점 값을 반올림해 표시해요.</li>
                </ul>
            </div>
        </AppModal>
    )
}
