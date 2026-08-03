import express from "express"
import { getWeeklyAiReport } from "../controller/ai.js"
import { isAuth } from "../middleware/auth.js"

const router = express.Router()

// gpt api 호출
// GET http://localhost:3000/ai/weekly-report
router.get("/weekly-report", isAuth, getWeeklyAiReport)

export default router