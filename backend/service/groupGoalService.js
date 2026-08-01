// service/groupGoalService.js

import * as authRepository from "../repository/auth.js";
import * as groupRepository from "../repository/group.js";
import * as studyRepository from "../repository/study.js";
import * as todoRepository from "../repository/todo.js";

import { getCurrentWeekRange } from "../util/date.js";
import {
    buildWeeklyGoalProgress,
} from "../util/groupGoal.js";

/**
 * 상태 코드가 포함된 Service 오류 생성
 */
function createServiceError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;

    return error;
}

/**
 * 사용자 정보에서 그룹 ID 추출
 *
 * groupId가 ObjectId인 경우와
 * populate된 객체인 경우를 모두 처리
 */
function getUserGroupId(user) {
    return (
        user?.groupId?._id ||
        user?.groupId ||
        user?.group?._id ||
        user?.group ||
        null
    );
}

/**
 * 로그인 사용자의 주간 그룹 목표 달성 현황 조회
 */
export async function getMyWeeklyGroupGoalStatus(userId) {
    if (!userId) {
        throw createServiceError(
            401,
            "로그인 사용자 정보가 없습니다.",
        );
    }

    /*
     * 1. 사용자 및 사용자의 그룹 정보 조회
     */
    const user =
        await authRepository.findGroupByUserId(userId);

    if (!user) {
        throw createServiceError(
            404,
            "존재하지 않는 사용자입니다.",
        );
    }

    const groupId = getUserGroupId(user);

    if (!groupId) {
        throw createServiceError(
            404,
            "현재 배정된 그룹이 없습니다.",
        );
    }

    /*
     * 2. 그룹 정보와 그룹 목표 조회
     */
    const group =
        await groupRepository.findGroupGoalsById(groupId);

    if (!group) {
        throw createServiceError(
            404,
            "배정된 그룹 정보를 찾을 수 없습니다.",
        );
    }

    /*
     * 3. 한국 시간 기준 이번 주 월요일~일요일
     */
    const {
        startDate: weekStartDate,
        endDate: weekEndDate,
    } = getCurrentWeekRange();

    /*
     * 4. 이번 주 공부 통계와 Todo 통계 동시 조회
     */
    const [
        studyResult,
        todoResult,
    ] = await Promise.all([
        studyRepository.findWeeklyStudySummaryByUser(
            userId,
            weekStartDate,
            weekEndDate,
        ),

        todoRepository.findWeeklyTodoSummaryByUser(
            userId,
            weekStartDate,
            weekEndDate,
        ),
    ]);

    /*
     * Repository에서 결과가 없더라도
     * 안전하게 기본값 사용
     */
    const studySummary = studyResult || {
        weeklyStudySeconds: 0,
        attendanceDays: 0,
        attendanceDates: [],
    };

    const todoSummary = todoResult || {
        totalTodoCount: 0,
        completedTodoCount: 0,
        todoCompletionRate: 0,
    };

    /*
     * 5. Mongoose 하위 문서를 일반 객체 형태로 정리
     */
    const groupGoals = [...(group.goals || [])]
        .sort((a, b) => a.order - b.order)
        .map((goal) => ({
            goalType: goal.goalType,
            targetValue: Number(goal.targetValue) || 0,
            unit: goal.unit,
            order: goal.order,
        }));

    /*
     * 6. 목표 진행률 계산에 사용할 개인 주간 현황
     */
    const weeklySummary = {
        weeklyStudySeconds:
            Number(studySummary.weeklyStudySeconds) || 0,

        todoCompletionRate:
            Number(todoSummary.todoCompletionRate) || 0,

        attendanceDays:
            Number(studySummary.attendanceDays) || 0,
    };

    /*
     * 7. 각 목표 진행률과 전체 달성률 계산
     */
    const {
        goals,
        overallAchievementRate,
    } = buildWeeklyGoalProgress(
        groupGoals,
        weeklySummary,
    );

    /*
     * 8. Controller에 최종 결과 반환
     */
    return {
        weekStartDate,
        weekEndDate,

        group: {
            _id: group._id,
            groupName: group.groupName,
            groupColor: group.groupColor,
            groupTime: group.groupTime,
        },

        goals,

        overallAchievementRate,

        weeklyStudySeconds:
            weeklySummary.weeklyStudySeconds,

        attendanceDays:
            weeklySummary.attendanceDays,

        attendanceDates:
            studySummary.attendanceDates || [],

        totalTodoCount:
            Number(todoSummary.totalTodoCount) || 0,

        completedTodoCount:
            Number(todoSummary.completedTodoCount) || 0,

        todoCompletionRate:
            weeklySummary.todoCompletionRate,
    };
}