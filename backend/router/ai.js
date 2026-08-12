import express from "express"
import { getAiReportStatus, generateAiReport } from "../controller/ai.js"
import { isAuth } from "../middleware/auth.js"

const router = express.Router()

// 오늘 리포트 상태 조회 (생성하지 않고 현재 리포트 + 생성 가능 여부만 확인)
// GET http://127.0.0.1:3000/ai/report
router.get("/report", isAuth, getAiReportStatus)

// gpt api 호출
// "새 리포트 생성하기" 버튼 클릭 시: 직전 리포트 이후 3시간이 쌓였는지 확인 후 생성
// POST http://127.0.0.1:3000/ai/report
router.post("/report", isAuth, generateAiReport)

export default router