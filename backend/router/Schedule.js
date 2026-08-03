import express from "express"
import { isAuth } from "../middleware/auth.js"
import * as scheduleController from "../controller/schedule.js"

const router = express.Router()


//스케쥴 가져오기
router.get("/", isAuth, scheduleController.getSchedules)



router.post("/", isAuth, scheduleController.addSchedule)


router.patch("/:scheduleId", isAuth, scheduleController.updateSchedule)


router.delete("/:scheduleId", isAuth, scheduleController.deleteSchedule)

export default router