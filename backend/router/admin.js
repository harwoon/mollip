import express from "express"
import { isAuth, isAdmin } from "../middleware/auth.js"
import * as adminController from "../controller/admin.js"
import * as groupController from "../controller/group.js"

const router = express.Router()

// 해당 라우터 전체에 두 미들웨어 순서대로 적용
router.use(isAuth, isAdmin)

// 회원 관리
// =================================================
// http://127.0.0.1:3000/admin/users/count
router.get("/users/count", adminController.getUserCount)

// http://127.0.0.1:3000/admin/users
router.get("/users", adminController.getUsers)

// http://127.0.0.1:3000/admin/users/:id
router.get("/users/:id", adminController.getUserDetail)

// 그룹 ID 자동 부여
// http://127.0.0.1:3000/admin/assign-weekly
router.post("/assign-weekly", groupController.runWeeklyGroupAssignment)

// 그룹 관리
// =================================================
// http://127.0.0.1:3000/admin/groups/count
router.get("/groups/count", groupController.getGroupGount)

// http://127.0.0.1:3000/admin/groups
router.get("/groups", groupController.getGroups)

// http://127.0.0.1:3000/admin/groups/:id
router.get("/groups/:id", groupController.getGroupsColor)

// http://127.0.0.1:3000/admin/groups
router.post("/groups", groupController.addGroup)

// http://127.0.0.1:3000/admin/groups/:id
router.patch("/groups/:id", groupController.updateGroup)

export default router
