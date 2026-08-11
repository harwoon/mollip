import assert from "node:assert/strict"
import test from "node:test"

import {
    buildGoalProgressRows,
    buildOverallProgressSummary,
    formatGoalValue
} from "./groupGoalDisplay.js"


test("목표 단위에 맞춰 현재값과 목표값을 읽기 쉽게 표시한다", () => {
    assert.equal(formatGoalValue(13 / 60, "HOUR", { isTarget: false }), "0시간 13분")
    assert.equal(formatGoalValue(6, "HOUR", { isTarget: true }), "6시간")
    assert.equal(formatGoalValue(66.67, "PERCENT"), "66.67%")
    assert.equal(formatGoalValue(1, "DAY"), "1일")
})


test("실제 목표 응답을 설명 표의 행으로 변환하고 진행률을 100%로 제한한다", () => {
    const rows = buildGoalProgressRows([
        {
            goalType: "MIN_STUDY_TIME",
            currentValue: 13 / 60,
            targetValue: 6,
            unit: "HOUR",
            progressRate: 3.6
        },
        {
            goalType: "TODO_COMPLETION_RATE",
            currentValue: 66.67,
            targetValue: 50,
            unit: "PERCENT",
            progressRate: 133.34
        }
    ])

    assert.deepEqual(rows, [
        {
            goalType: "MIN_STUDY_TIME",
            label: "주간 최소 공부시간",
            currentTargetText: "0시간 13분 / 6시간",
            progressRate: 3.6,
            progressText: "약 3.6%"
        },
        {
            goalType: "TODO_COMPLETION_RATE",
            label: "개인 Todo 달성률",
            currentTargetText: "66.67% / 50%",
            progressRate: 100,
            progressText: "100%"
        }
    ])
})


test("개별 진행률 합계와 서버 전체 달성률을 계산 요약으로 표시한다", () => {
    const summary = buildOverallProgressSummary(
        [
            { progressRate: 3.6 },
            { progressRate: 1.4 },
            { progressRate: 100 },
            { progressRate: 33.33 }
        ],
        34.58
    )

    assert.deepEqual(summary, {
        progressExpression: "3.6 + 1.4 + 100 + 33.33",
        divisor: 4,
        preciseRate: 34.58,
        displayedRate: 35
    })
})
