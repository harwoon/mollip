import express from "express"
import { isAuth } from "../middleware/auth.js"
import * as statController from "../controller/statistics.js"

const router = express.Router()

// 총 공부량 시간 가져오기
//http://127.0.0.1:3000/statistics/total?type=daily&date=2026-07-26
router.get("/total",isAuth,statController.getTotal)

// 일간/주간/월간 과목 비율 조회
//http://127.0.0.1:3000/statistics/ratio?type=daily&date=2026-07-26
router.get("/ratio",isAuth,statController.getRatio)


// [주간현활-그룹통계] 그룹의 연속 공부 달성일 평균
// http://127.0.0.1:3000/statistics/streak
router.get("/streak",isAuth, statController.getStreak)

// 그룹의 주간 일별 공부 시간 평균
// http://127.0.0.1:3000/statistics/week?date=2026-07-29
router.get("/week",isAuth , statController.getWeeklyCompareStats)

// 과목별 공부시간 요약 및 이전 기간 비교
router.get("/subject-summary", isAuth, statController.getSubjectSummary)

// 주간 개인 및 그룹 Todo 달성률 비교
// http://127.0.0.1:3000/statistics/todo-week?date=2026-07-30
router.get("/todo-week", isAuth, statController.getWeeklyTodoCompare)

export default router