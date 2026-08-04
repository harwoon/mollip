import express from "express"
import { isAuth, isAdmin } from "../middleware/auth.js"
import * as adminUserController from "../controller/adminUser.js"  // 회원 조회/상세/엑셀 등 "회원" 관련 컨트롤러
import * as adminGroupStatsController from "../controller/adminGroupStats.js"  // 그룹 통계(달성률, 공부시간 등 집계) 컨트롤러
import * as adminDashboardController from "../controller/adminDashboard.js"  // 홈 대시보드 지표(추이, 로그 등) 컨트롤러
import * as groupController from "../controller/group.js"  // 그룹 CRUD (생성/수정/목록) — 일반 유저용 router/group.js와 공유하는 컨트롤러
import * as adminMemberStatusController from "../controller/adminMemberStatus.js" // 관리회원현황 컨트롤러
import * as statController from "../controller/statistics.js"
import * as todoController from "../controller/todo.js"

const router = express.Router()

router.use(isAuth, isAdmin)  // 해당 라우터 전체에 두 미들웨어 순서대로 적용

// ====================== 홈 대시 보드 controller/adminDashboard.js =========================
// http://127.0.0.1:3000/admin/study-time-trend?type=daily&startDate=2026-07-01&endDate=2026-07-14
router.get("/study-time-trend", adminDashboardController.getStudyTimeTrend)

// 관리자 홈 전체 회원의 이번 주 평균 공부시간 조회
// studyUserCount: 이번 주에 실제 공부한 회원 수
// totalWeeklyStudyTime: 이번 주 전체 회원 공부시간 합계 (분)
// averageWeeklyStudyTime: 이번 주 공부한 회원 기준 평균 공부시간 (분)
// http://127.0.0.1:3000/admin/weekly-average-study-time
router.get("/weekly-average-study-time", adminDashboardController.getWeeklyAverageStudyTime)

// 관리자 홈 전체 회원의 이번 주 총 공부시간
// currentWeeklyStudyTime: 정상 회원 + 휴면 회원 이번주 총 공부시간
// withdrawnWeeklyStudyTime: 탈퇴한 회원 이번주 총 공부시간
// totalWeeklyStudyTime: 현재회원, 탈토회원 포함한 이번주 총 공부시간
// http://localhost:3000/admin/weekly-total-study-time
router.get("/weekly-total-study-time", adminDashboardController.getWeeklyTotalStudyTime)

// http://127.0.0.1:3000/admin/todo-achievement/weekly
router.get("/todo-achievement/weekly", adminDashboardController.getWeeklyTodoAchievement)

// 가입 탈퇴 로그 가져오기
// http://127.0.0.1:3000/admin/log
router.get("/log", adminDashboardController.getLog)



// ====================== 회원 관리 controller/adminUser.js ===========================
// 전체 회원 수 조회 : 탈퇴회원 제외, 정상회원+휴면회원
// http://127.0.0.1:3000/admin/users/count
router.get("/users/count", adminUserController.getUserCount)

// http://127.0.0.1:3000/admin/users/active
router.get("/users/active", adminUserController.getActiveUsers)

// http://127.0.0.1:3000/admin/users/export
router.get("/users/export", adminUserController.getUsersExport)

// http://127.0.0.1:3000/admin/users
router.get("/users", adminUserController.getUsers)

// http://127.0.0.1:3000/admin/users/:id
router.get("/users/:id", adminUserController.getUserDetail)

// 유저 일간/주간/월간 총 공부시간 가져오기
// http://127.0.0.1:3000/admin/user/totalStudy?type=daily&userId=6a670d0cc8a40c958ee09962&start=2026-07-20&end=2026-07-30
router.get("/user/totalStudy", adminUserController.getTotalStudy)



// ====================== 그룹 관리 controller/adminGroupStats.js + controller/group.js ===========================
// http://127.0.0.1:3000/admin/groups/count
router.get("/groups/count", groupController.getGroupCount)

// 그룹 주간 총 공부시간, 모든 그룹 총 공부시간
// http://127.0.0.1:3000/admin/groups/weekly-study-time
router.get("/groups/weekly-study-time", adminGroupStatsController.getWeeklyGroupStudySummary,)

// 그룹별 인원, 평균 목표 달성률, 평균 공부시간, 평균 학습일 조회
// http://127.0.0.1:3000/admin/groups/statistics
router.get("/groups/statistics", adminGroupStatsController.getGroupStatistics)

// http://127.0.0.1:3000/admin/group-todo-achievement?date=2026-07-30
router.get("/group-todo-achievement", adminGroupStatsController.getGroupTodoAchievement)

// http://127.0.0.1:3000/admin/groups
router.get("/groups", groupController.getGroups)

// http://127.0.0.1:3000/admin/groups/:id
router.get("/groups/:id", groupController.getGroupsColor)

// http://127.0.0.1:3000/admin/groups
router.post("/groups", groupController.addGroup)

// http://127.0.0.1:3000/admin/groups/:id
router.patch("/groups/:id", groupController.updateGroup)

// 그룹 ID 자동 부여
// http://127.0.0.1:3000/admin/assign-weekly
router.post("/assign-weekly", groupController.runWeeklyGroupAssignment)

// ====================== 관리회원현황
// 대상 조회
// http://127.0.0.1:3000/admin/member-status
router.get("/member-status", adminMemberStatusController.getMemberStatus)

// 타입별 선택 회원 전체 메일 발송
// http://localhost:3000/admin/member-status/send-all-mail
router.post("/member-status/send-all-mail", adminMemberStatusController.sendAllMemberStatusMail)


// ====================== 유저 상세
// 일간/주간/월간 과목 비율 조회
//http://127.0.0.1:3000/admin/ratio?type=daily&date=2026-07-26&userid=6a6fdd0ea7b6baa85e4d088d
router.get("/ratio", isAuth, statController.getRatio)

// 일간 목표달성률 조회
// http://127.0.0.1:3000/admin/achievement?type=daily&date=2026-07-27&userid=6a6fdd0ea7b6baa85e4d088d
// http://127.0.0.1:3000/admin/achievement?type=weekly&date=2026-07-27&userid=6a6fdd0ea7b6baa85e4d088d
// http://127.0.0.1:3000/admin/achievement?type=monthly&date=2026-07-27&userid=6a6fdd0ea7b6baa85e4d088d
router.get("/achievement", isAuth, todoController.getAchievement)

export default router