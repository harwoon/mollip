import express from "express"
import { isAuth } from "../middleware/auth.js"
import * as groupController from "../controller/group.js"

const router = express.Router()

// 유저의 그룹 정보 조회
// http://127.0.0.1:3000/group
router.get("/",isAuth,groupController.getGroup)

// 그룹 정보 전체 조회
// http://127.0.0.1:3000/group/groups
router.get("/groups",isAuth,groupController.getGroups)

// 상위 그룹 조회
// http://127.0.0.1:3000/group/higher
router.get("/higher",isAuth,groupController.getHigher)

// 하위 그룹 조회
// http://127.0.0.1:3000/group/lower
router.get("/lower",isAuth,groupController.getLower)

// 그룹의 연속 공부 달성일 평균
// http://127.0.0.1:3000/group/streak
router.get("/streak",isAuth,groupController.getStreak)

// 그룹의 주간 일별 공부 시간 평균
// http://127.0.0.1:3000/group/week?date=2026-07-29
router.get("/week",isAuth,groupController.getWeeklyCompareStats)

export default router