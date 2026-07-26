import express from "express"
import { isAuth } from "../middleware/auth.js"
import * as statController from "../controller/statistics.js"

const router = express.Router()

// 총 공부량 시간 가져오기
//http://127.0.0.1:3000/statistics/total?type=daily&date=2026-07-26
router.get("/total",isAuth,statController.getTotal)

// 일간/주간/월간 과목 비율 조회
//http://127.0.0.1:3000/statistics/ratio?type=daily&subject=국어&date=2026-07-26
router.get("/ratio",isAuth,statController.getRatio)

export default router