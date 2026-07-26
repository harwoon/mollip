import express from "express"
import * as studyController from "../controller/study.js"

const router = express.Router()

// 공부 기록
//http://127.0.0.1:3000/study/addStudy
router.post("/addStudy", studyController.addStudy)

export default router