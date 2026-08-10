// service/adminGroupStatisticsService.js

import * as groupRepository from "../repository/group.js";
import * as authRepository from "../repository/auth.js";
import * as studyRepository from "../repository/study.js";
import * as todoRepository from "../repository/todo.js";

import {
    getCurrentWeekRange,
} from "../util/date.js";

import {
    calculateAverageGoalAchievementRate,
} from "../util/groupGoal.js";
import { buildGroupMemberGoalRows } from "../util/adminGroupMembers.js";


/*
 * 소수점 둘째 자리까지 반환
 *
 * 예:
 * 3.4567 → 3.46
 * 5      → 5
 */
function roundToTwo(value) {
    const numberValue = Number(value) || 0;

    return Number(numberValue.toFixed(2));
}


/*
 * 그룹 목표 데이터를 일반 객체로 변환
 *
 * Mongoose Document 형태로 조회되더라도
 * 프론트와 계산 함수에서 안전하게 사용할 수 있도록 정리
 */
function normalizeGoals(goals) {
    if (!Array.isArray(goals)) {
        return [];
    }

    return goals.map((goal) => ({
        _id: goal._id,

        goalType:
            goal.goalType,

        targetValue:
            Number(goal.targetValue) || 0,

        unit:
            goal.unit,

        order:
            Number(goal.order) || 0,
    }));
}


/*
 * 관리자 그룹별 주간 통계 조회
 *
 * 계산 항목:
 * 1. 그룹별 활성 일반 회원 수
 * 2. 그룹별 평균 목표 달성률
 * 3. 그룹별 평균 공부시간
 * 4. 그룹별 평균 접속 학습일
 */
export async function getGroupStatistics() {
    /*
     * 1. 한국 시간 기준 이번 주 범위 조회
     *
     * 월요일부터 일요일까지
     *
     * 예:
     * weekStartDate: "2026-07-27"
     * weekEndDate:   "2026-08-02"
     */
    const {
        startDate: weekStartDate,
        endDate: weekEndDate,
    } = getCurrentWeekRange();


    /*
     * 2. 전체 그룹과
     * 그룹에 소속된 활성 일반 회원을 동시에 조회
     */
    const [
        groups,
        activeUsers,
    ] = await Promise.all([
        groupRepository.findAllGroups(),

        authRepository.findActiveUsersWithGroup(),
    ]);


    /*
     * 조회 결과가 배열이 아닐 경우를 대비해
     * 안전하게 빈 배열로 처리
     */
    const safeGroups =
        Array.isArray(groups)
            ? groups
            : [];

    const safeActiveUsers =
        Array.isArray(activeUsers)
            ? activeUsers
            : [];


    /*
     * 3. 활성 일반 회원 ID 배열 생성
     *
     * 공부와 Todo 데이터를
     * 여러 사용자 기준으로 한 번에 조회하기 위해 사용
     */
    const activeUserIds =
        safeActiveUsers.map(
            (user) => user._id,
        );


    /*
     * 4. 활성 회원들의 이번 주 공부 통계와
     * Todo 통계를 동시에 조회
     *
     * 공부 통계:
     * - weeklyStudySeconds
     * - attendanceDays
     * - attendanceDates
     *
     * Todo 통계:
     * - totalTodoCount
     * - completedTodoCount
     * - todoCompletionRate
     */
    const [
        studySummaries,
        todoSummaries,
    ] = await Promise.all([
        studyRepository
            .findWeeklyStudySummariesByUsers(
                activeUserIds,
                weekStartDate,
                weekEndDate,
            ),

        todoRepository
            .findWeeklyTodoSummariesByUsers(
                activeUserIds,
                weekStartDate,
                weekEndDate,
            ),
    ]);


    /*
     * Repository 결과가 배열이 아닐 경우
     * 빈 배열로 처리
     */
    const safeStudySummaries =
        Array.isArray(studySummaries)
            ? studySummaries
            : [];

    const safeTodoSummaries =
        Array.isArray(todoSummaries)
            ? todoSummaries
            : [];


    /*
     * 5. 사용자별 공부 통계 Map 생성
     *
     * 구조:
     *
     * userId => {
     *   weeklyStudySeconds,
     *   attendanceDays,
     *   attendanceDates
     * }
     */
    const studySummaryMap = new Map(
        safeStudySummaries.map(
            (summary) => [
                String(summary.userId),

                {
                    weeklyStudySeconds:
                        Number(
                            summary.weeklyStudySeconds,
                        ) || 0,

                    attendanceDays:
                        Number(
                            summary.attendanceDays,
                        ) || 0,

                    attendanceDates:
                        Array.isArray(
                            summary.attendanceDates,
                        )
                            ? summary.attendanceDates
                            : [],
                },
            ],
        ),
    );


    /*
     * 6. 사용자별 Todo 통계 Map 생성
     *
     * 구조:
     *
     * userId => {
     *   totalTodoCount,
     *   completedTodoCount,
     *   todoCompletionRate
     * }
     */
    const todoSummaryMap = new Map(
        safeTodoSummaries.map(
            (summary) => [
                String(summary.userId),

                {
                    totalTodoCount:
                        Number(
                            summary.totalTodoCount,
                        ) || 0,

                    completedTodoCount:
                        Number(
                            summary.completedTodoCount,
                        ) || 0,

                    todoCompletionRate:
                        Number(
                            summary.todoCompletionRate,
                        ) || 0,
                },
            ],
        ),
    );


    /*
     * 7. 사용자별 공부 통계와 Todo 통계를
     * 하나의 Map으로 합침
     *
     * 공부 기록이나 Todo 기록이 없는 회원도
     * 모두 0으로 저장
     */
    const userWeeklySummaryMap =
        new Map();

    for (const user of safeActiveUsers) {
        const userId =
            String(user._id);

        const studySummary =
            studySummaryMap.get(userId) || {
                weeklyStudySeconds: 0,
                attendanceDays: 0,
                attendanceDates: [],
            };

        const todoSummary =
            todoSummaryMap.get(userId) || {
                totalTodoCount: 0,
                completedTodoCount: 0,
                todoCompletionRate: 0,
            };

        userWeeklySummaryMap.set(
            userId,
            {
                weeklyStudySeconds:
                    studySummary.weeklyStudySeconds,

                attendanceDays:
                    studySummary.attendanceDays,

                attendanceDates:
                    studySummary.attendanceDates,

                totalTodoCount:
                    todoSummary.totalTodoCount,

                completedTodoCount:
                    todoSummary.completedTodoCount,

                todoCompletionRate:
                    todoSummary.todoCompletionRate,
            },
        );
    }


    /*
     * 8. 그룹별 회원 ID 목록 생성
     *
     * 구조:
     *
     * groupId => [
     *   userId,
     *   userId
     * ]
     */
    const groupMembersMap =
        new Map();

    for (const user of safeActiveUsers) {
        /*
         * 그룹이 없는 회원은 제외
         */
        if (!user.groupId) {
            continue;
        }

        const groupId =
            String(user.groupId);

        const userId =
            String(user._id);

        if (!groupMembersMap.has(groupId)) {
            groupMembersMap.set(
                groupId,
                [],
            );
        }

        groupMembersMap
            .get(groupId)
            .push(userId);
    }


    /*
     * 9. 그룹별 통계 계산
     */
    const groupStatistics =
        safeGroups.map((group) => {
            const groupId =
                String(group._id);

            /*
             * DB의 groupTime은 초 단위로 가정
             */
            const groupTimeSeconds =
                Number(group.groupTime) || 0;

            /*
             * 그룹 목표 4개 정리
             */
            const goals =
                normalizeGoals(group.goals);

            /*
             * 해당 그룹에 속한 활성 회원 ID 목록
             */
            const memberIds =
                groupMembersMap.get(groupId) || [];

            /*
             * 그룹 인원
             */
            const memberCount =
                memberIds.length;


            /*
             * 그룹 회원별 주간 통계 배열 생성
             *
             * 활동 기록이 없는 회원도
             * 0값으로 포함
             */
            const memberSummaries =
                memberIds.map((memberId) => {
                    return (
                        userWeeklySummaryMap
                            .get(memberId) || {
                            weeklyStudySeconds: 0,
                            attendanceDays: 0,
                            attendanceDates: [],

                            totalTodoCount: 0,
                            completedTodoCount: 0,
                            todoCompletionRate: 0,
                        }
                    );
                });


            /*
             * 그룹 회원 전체의 공부시간과
             * 출석일 합계
             */
            let totalStudySeconds = 0;
            let totalAttendanceDays = 0;

            for (
                const summary of memberSummaries
            ) {
                totalStudySeconds +=
                    Number(
                        summary.weeklyStudySeconds,
                    ) || 0;

                totalAttendanceDays +=
                    Number(
                        summary.attendanceDays,
                    ) || 0;
            }


            /*
             * 그룹 평균 공부시간
             *
             * 총 공부시간(초)
             * ÷ 그룹 인원
             * ÷ 3600
             *
             * 활동하지 않은 회원도
             * 그룹 인원에 포함
             */
            const averageStudyHours =
                memberCount === 0
                    ? 0
                    : roundToTwo(
                        totalStudySeconds /
                        memberCount /
                        3600,
                    );


            /*
             * 그룹 평균 접속 학습일
             *
             * 회원별 출석일 합계
             * ÷ 그룹 인원
             *
             * 하루 공부시간 합계가
             * 60초 이상이면 출석 1일
             */
            const averageAttendanceDays =
                memberCount === 0
                    ? 0
                    : roundToTwo(
                        totalAttendanceDays /
                        memberCount,
                    );


            /*
             * 그룹 평균 목표 달성률
             *
             * 각 회원마다 그룹 목표 4개를 계산한 후
             * 회원별 overallAchievementRate의 평균을 구함
             *
             * 활동 기록이 없는 회원은
             * 0%로 포함
             */
            const averageGoalAchievementRate =
                calculateAverageGoalAchievementRate(
                    goals,
                    memberSummaries,
                );


            /*
             * 프론트에 반환할 그룹 통계
             */
            return {
                _id:
                    group._id,

                groupName:
                    group.groupName,

                groupColor:
                    group.groupColor,

                /*
                 * DB 저장값
                 * 초 단위
                 */
                groupTime:
                    groupTimeSeconds,

                /*
                 * 관리자 테이블과 수정 폼 표시용
                 * 시간 단위
                 */
                groupConditionHours:
                    roundToTwo(
                        groupTimeSeconds / 3600,
                    ),

                /*
                 * 그룹 수정 폼에서 사용하는
                 * 기존 목표 정보
                 */
                goals,

                /*
                 * 그룹별 통계
                 */
                memberCount,

                averageGoalAchievementRate,

                averageStudyHours,

                averageAttendanceDays,
            };
        });


    /*
     * 10. Controller로 결과 반환
     */
    return {
        weekStartDate,
        weekEndDate,

        groups:
            groupStatistics,
    };
}

export async function getGroupMembersGoalStatus(groupId) {
    const group = await groupRepository.findGroupGoalsById(groupId)

    if (!group) {
        const error = new Error("존재하지 않는 그룹입니다.")
        error.statusCode = 404
        throw error
    }

    const members = await authRepository.getUsersByGroupId(groupId)
    const memberIds = members.map((member) => member._id)
    const {
        startDate: weekStartDate,
        endDate: weekEndDate,
    } = getCurrentWeekRange()

    const [studySummaries, todoSummaries] = await Promise.all([
        studyRepository.findWeeklyStudySummariesByUsers(
            memberIds,
            weekStartDate,
            weekEndDate,
        ),
        todoRepository.findWeeklyTodoSummariesByUsers(
            memberIds,
            weekStartDate,
            weekEndDate,
        ),
    ])

    return {
        group: {
            _id: group._id,
            groupName: group.groupName,
            groupColor: group.groupColor,
        },
        weekStartDate,
        weekEndDate,
        members: buildGroupMemberGoalRows({
            members,
            goals: group.goals || [],
            studySummaries,
            todoSummaries,
        }),
    }
}
