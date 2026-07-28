import express from "express"
import { isAuth } from "../middleware/auth.js"
import * as groupcontroller from "../controller/group.js"

const router = express.Router()

//http://127.0.0.1:3000/group 그룹추가
router.post("/", groupcontroller.addGroup)

//http://127.0.0.1:3000/group/assign-weekly 그룹ID 부여
router.post("/assign-weekly", groupcontroller.runWeeklyGroupAssignment)













export default router