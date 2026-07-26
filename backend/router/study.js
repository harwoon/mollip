import express from "express"
import { isAuth } from "../middleware/auth.js"
import * as studyController from "../controller/study.js"

const router = express.Router()

// 공부 기록 추가
//http://127.0.0.1:3000/study/addStudy
router.post("/addStudy",isAuth, studyController.addStudy)

// 일간 기록 조회
//http://127.0.0.1:3000/study/records?date=2026-07-26
router.get("/records", isAuth, studyController.getDailyRecords)

// 주간 기록 조회

// 월간 기록 조회

// 일간 과목 기록 조회

// 주간 과목 기록 조회

// 월간 과목 기록 조회


export default router