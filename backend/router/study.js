import express from "express"
import * as studyController from "../controller/study.js"
import { isAuth } from "../middleware/auth.mjs"

const router = express.Router()

// 공부 기록
router.post("/study", studyController.study)

export default router