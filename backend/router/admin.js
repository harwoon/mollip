import express from "express"
import { isAuth, isAdmin } from "../middleware/auth.js"
import * as adminController from "../controller/admin.js"
import * as groupController from "../controller/group.js"

const router = express.Router()

// 해당 라우터 전체에 두 미들웨어 순서대로 적용
router.use(isAuth, isAdmin)

// 홈 대시보드 =================================================
// http://127.0.0.1:3000/admin/study-time-trend?type=daily&startDate=2026-07-01&endDate=2026-07-14
router.get("/study-time-trend", adminController.getStudyTimeTrend)


// 회원 관리 =================================================
// 전체 회원 수 조회 : 탈퇴회원 제외, 정상회원+휴면회원
// http://127.0.0.1:3000/admin/users/count
router.get("/users/count", adminController.getUserCount)

// http://127.0.0.1:3000/admin/users
router.get("/users", adminController.getUsers)

// http://127.0.0.1:3000/users/active
router.get("/users/active", adminController.getActiveUsers)

// http://127.0.0.1:3000/admin/users/export
router.get("/users/export", adminController.getUsersExport)

// http://127.0.0.1:3000/admin/users/:id
router.get("/users/:id", adminController.getUserDetail)

// 그룹 ID 자동 부여
// http://127.0.0.1:3000/admin/assign-weekly
router.post("/assign-weekly", groupController.runWeeklyGroupAssignment)

// http://127.0.0.1:3000/admin/todo-achievement/weekly
router.get("/todo-achievement/weekly", adminController.getWeeklyTodoAchievement)

// 관리자 홈 전체 회원의 이번 주 평균 공부시간 조회
// http://127.0.0.1:3000/admin/weekly-average-study-time
router.get("/weekly-average-study-time", adminController.getWeeklyAverageStudyTime)


// 그룹 관리 =================================================
// http://127.0.0.1:3000/admin/groups/count
router.get("/groups/count", groupController.getGroupGount)

// 그룹 주간 총 공부시간, 모든 그룹 총 공부시간
// http://127.0.0.1:3000/admin/groups/weekly-study-time
router.get("/groups/weekly-study-time", adminController.getWeeklyGroupStudySummary,)

// http://127.0.0.1:3000/admin/groups
router.get("/groups", groupController.getGroups)

// 그룹별 인원, 평균 목표 달성률, 평균 공부시간, 평균 학습일 조회
// http://127.0.0.1:3000/admin/groups/statistics
router.get("/groups/statistics", adminController.getGroupStatistics)

// http://127.0.0.1:3000/admin/groups/:id
router.get("/groups/:id", groupController.getGroupsColor)

// http://127.0.0.1:3000/admin/groups
router.post("/groups", groupController.addGroup)

// http://127.0.0.1:3000/admin/groups/:id
router.patch("/groups/:id", groupController.updateGroup)

// http://127.0.0.1:3000/admin/group-todo-achievement?date=2026-07-30
router.get("/group-todo-achievement", adminController.getGroupTodoAchievement)

// 가입 탈퇴 로그 가져오기
// http://127.0.0.1:3000/admin/log
router.get("/log", adminController.getLog)


// 유저 상세 조회 =================================================
// 유저 일간/주간/월간 총 공부시간 가져오기
// http://127.0.0.1:3000/admin/user/totalStudy?type=daily&userId=6a670d0cc8a40c958ee09962&start=2026-07-20&end=2026-07-30
router.get("/user/totalStudy", adminController.getTotalStudy)



export default router