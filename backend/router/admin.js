import express from "express"
import { isAuth, isAdmin } from "../middleware/auth.js"
import * as adminController from "../controller/admin.js"

const router = express.Router()

// 해당 라우터 전체에 두 미들웨어 순서대로 적용
router.use(isAuth, isAdmin)

// 회원 관리
// http://127.0.0.1:3000/admin/
router.get("/users", adminController.getUsers)
router.get("/users/:id", adminController.getUserDetail)

export default router
