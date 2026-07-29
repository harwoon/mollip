import express from "express"
import { isAuth } from "../middleware/auth.js"
import * as groupController from "../controller/group.js"

const router = express.Router()

// 유저의 그룹 정보 조회
// http://127.0.0.1:3000/group
router.get("/",isAuth,groupController.getGroup)

export default router