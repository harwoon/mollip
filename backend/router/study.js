import express from "express"
import { isAuth } from "../middleware/auth.js"
import * as studyController from "../controller/study.js"

const router = express.Router()

// 공부 기록 추가
//http://127.0.0.1:3000/study/addStudy
router.post("/addStudy",isAuth, studyController.addStudy)

// 일간/주간/월간 기록 조회
//http://127.0.0.1:3000/study/records?type=daily&date=2026-07-26
//http://127.0.0.1:3000/study/records?type=weekly&date=2026-07-26
//http://127.0.0.1:3000/study/records?type=monthly&date=2026-07-26
router.get("/records", isAuth, studyController.getRecords)

// 일간/주간/월간 과목 기록 조회
//http://127.0.0.1:3000/study/records/subject?type=daily&subject=국어&date=2026-07-26
router.get("/records/subject",isAuth,studyController.getRecordsbySubject)



export default router