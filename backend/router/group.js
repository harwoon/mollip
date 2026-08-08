import express from "express";
import { isAuth } from "../middleware/auth.js";
import * as groupController from "../controller/group.js";

const router = express.Router();

// 사용자의 그룹 정보 조회
// http://127.0.0.1:3000/group
router.get("/", isAuth, groupController.getGroup);

// 그룹 정보 전체 조회
// http://127.0.0.1:3000/group/groups
router.get("/groups", isAuth, groupController.getGroups);

// 상위 그룹 조회
// http://127.0.0.1:3000/group/higher
router.get("/higher", isAuth, groupController.getHigher);

// 하위 그룹 조회
// http://127.0.0.1:3000/group/lower
router.get("/lower", isAuth, groupController.getLower);

// 주간 랭킹 조회
//http://127.0.0.1:3000/group/weekly-ranking
router.get("/weekly-ranking", isAuth, groupController.getWeeklyRanking);

// 로그인 사용자의 주간 그룹 목표 달성 현황
// GET http://127.0.0.1:3000/group/goals/me
router.get("/goals/me", isAuth, groupController.getMyWeeklyGroupGoals)

export default router;
