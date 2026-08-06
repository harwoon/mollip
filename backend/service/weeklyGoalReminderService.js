import User from "../models/User.js"
import * as groupRepository from "../repository/group.js"

import transporter from "../util/mailer.js"

import * as studyRepository
    from "../repository/study.js"

import {
    getCurrentWeekRange,
} from "../util/date.js"

import {
    calculateGoalProgress,
} from "../util/groupGoal.js"

import {
    getWeeklyGoalMailTemplate,
} from "../util/weeklyGoalMailTemplates.js"


// 메일로 안내할 시간 목표 종류
const TIME_GOAL_TYPES = new Set([
    "MIN_STUDY_TIME",
    "CHALLENGE_STUDY_TIME",
])

/*
 * 현재 주간 공부시간을 기준으로
 * 조건을 충족한 그룹과 최종 예상 그룹을 계산합니다.
 *
 * groups는 groupTime 내림차순으로 전달되어야 합니다.
 */
function buildAssignmentPreview(
    groups,
    weeklyStudySeconds,
) {
    const safeStudySeconds =
        Math.max(
            Number(weeklyStudySeconds) || 0,
            0,
        )

    /*
     * 현재 공부시간으로 조건을 충족한 모든 그룹
     */
    const eligibleGroups = groups
        .filter(
            (group) =>
                safeStudySeconds >=
                Number(group.groupTime),
        )
        .map((group) => ({
            groupId:
                String(group._id),

            groupName:
                group.groupName,

            requiredStudySeconds:
                Number(group.groupTime) || 0,

            requiredStudyHours:
                roundToTwo(
                    (
                        Number(
                            group.groupTime,
                        ) || 0
                    ) / 3600,
                ),
        }))

    /*
     * groups가 높은 조건부터 정렬되어 있으므로
     * 첫 번째 그룹이 실제 배정 예상 그룹입니다.
     */
    const expectedGroup =
        eligibleGroups[0] || null

    return {
        expectedGroup,
        eligibleGroups,
    }
}

function roundToTwo(value) {
    return Number(
        Number(value).toFixed(2),
    )
}


/*
 * 그룹 목표 중 공부시간 목표만 가져오고
 * 회원의 현재 공부시간과 남은 시간을 계산합니다.
 */
function buildTimeGoalStatuses(
    groupGoals,
    weeklyStudySeconds,
) {
    const currentStudyHours =
        (Number(weeklyStudySeconds) || 0) /
        3600

    return [...(groupGoals || [])]
        .filter(
            (goal) =>
                TIME_GOAL_TYPES.has(
                    goal.goalType,
                ) &&
                goal.unit === "HOUR",
        )
        .sort(
            (a, b) =>
                Number(a.order) -
                Number(b.order),
        )
        .map((goal) => {
            /*
             * 기존 그룹 목표 계산 유틸을 재사용합니다.
             *
             * 반환값:
             * targetValue
             * currentValue
             * progressRate
             * isAchieved
             */
            const progress =
                calculateGoalProgress(
                    goal,
                    {
                        weeklyStudySeconds,
                    },
                )

            const remainingHours =
                Math.max(
                    progress.targetValue -
                    currentStudyHours,
                    0,
                )

            return {
                ...progress,

                remainingHours:
                    roundToTwo(
                        remainingHours,
                    ),
            }
        })
}
/*
 * 메일에서 기준으로 사용할 대표 시간 목표
 *
 * 최소 공부시간을 우선 사용하고,
 * 최소 공부시간이 없으면 도전 공부시간을 사용합니다.
 */
function getPrimaryTimeGoal(
    goalStatuses = [],
) {
    return (
        goalStatuses.find(
            (goal) =>
                goal.goalType ===
                "MIN_STUDY_TIME",
        ) ||
        goalStatuses.find(
            (goal) =>
                goal.goalType ===
                "CHALLENGE_STUDY_TIME",
        ) ||
        null
    )
}
/*
 * 현재 그룹 바로 위의 상위 그룹 찾기
 *
 * 현재 그룹보다 groupTime이 크면서
 * 가장 작은 groupTime을 가진 그룹이
 * 바로 다음 그룹입니다.
 */
function findNextHigherGroup(
    groups,
    currentGroup,
) {
    const currentGroupTime =
        Number(currentGroup.groupTime) || 0

    return (
        groups
            .filter(
                (group) =>
                    String(group._id) !==
                    String(
                        currentGroup._id,
                    ) &&
                    Number(group.groupTime) >
                    currentGroupTime,
            )
            .sort(
                (a, b) =>
                    Number(a.groupTime) -
                    Number(b.groupTime),
            )[0] || null
    )
}
/*
 * 다음 그룹의 대표 시간 목표와
 * 목표까지 남은 시간을 계산합니다.
 */
function buildNextGroupGoalPreview({
    groups,
    currentGroup,
    weeklyStudySeconds,
}) {
    const nextGroup =
        findNextHigherGroup(
            groups,
            currentGroup,
        )

    /*
     * 다음 그룹이 없으면 현재 그룹이
     * 최상위 그룹입니다.
     */
    if (!nextGroup) {
        return null
    }

    /*
     * 다음 그룹의 시간 목표 진행 상태 계산
     */
    const nextGoalStatuses =
        buildTimeGoalStatuses(
            nextGroup.goals,
            weeklyStudySeconds,
        )

    const nextMainGoal =
        getPrimaryTimeGoal(
            nextGoalStatuses,
        )

    /*
     * 다음 그룹에 시간 목표가 있는 경우
     */
    if (nextMainGoal) {
        return {
            groupId:
                String(nextGroup._id),

            groupName:
                nextGroup.groupName,

            goalType:
                nextMainGoal.goalType,

            targetValue:
                nextMainGoal.targetValue,

            currentValue:
                nextMainGoal.currentValue,

            remainingHours:
                nextMainGoal.remainingHours,

            isAchieved:
                nextMainGoal.isAchieved,

            targetSource:
                "GROUP_GOAL",
        }
    }

    /*
     * 다음 그룹에는 목표가 없지만
     * 그룹 배정 기준 groupTime은 존재하는 경우
     *
     * groupTime은 공부시간 초 단위 기준입니다.
     */
    const targetHours =
        (Number(nextGroup.groupTime) || 0) /
        3600

    const currentHours =
        (Number(weeklyStudySeconds) || 0) /
        3600

    return {
        groupId:
            String(nextGroup._id),

        groupName:
            nextGroup.groupName,

        goalType: null,

        targetValue:
            roundToTwo(targetHours),

        currentValue:
            roundToTwo(currentHours),

        remainingHours:
            roundToTwo(
                Math.max(
                    targetHours -
                    currentHours,
                    0,
                ),
            ),

        isAchieved:
            currentHours >= targetHours,

        targetSource:
            "GROUP_TIME",
    }
}
/*
 * 매주 목표 안내 메일 발송
 *
 * Cron에서는 인수 없이 실행합니다.
 *
 * 테스트할 때는 다음처럼 사용할 수 있습니다.
 *
 * sendWeeklyGoalReminderMails({
 *     testRecipient: "내이메일@example.com",
 *     limit: 1,
 * })
 */
export async function sendWeeklyGoalReminderMails({
    testRecipient = null,
    limit = 0,
} = {}) {
    const dormantGroupId =
        process.env.DORMANT_GROUP_ID

    if (!dormantGroupId) {
        throw new Error(
            "DORMANT_GROUP_ID 환경변수가 없습니다.",
        )
    }

    /*
     * 기존 날짜 유틸 사용
     * 한국 날짜 기준 이번 주 월요일~일요일
     */
    const {
        startDate: weekStartDate,
        endDate: weekEndDate,
    } = getCurrentWeekRange()

    /*
     * 탈퇴하지 않은 일반 회원 조회
     *
     * 관리자 제외
     * 탈퇴 회원 제외
     * 그룹 없는 회원 제외
     * 휴면 그룹 회원 제외
     */
    let userQuery = User.find({
        role: "user",

        useYn: "Y",

        groupId: {
            $nin: [
                "",
                null,
                dormantGroupId,
            ],
        },
    }).select(
        "_id nickname email groupId",
    )

    /*
     * 테스트 시 회원 수 제한
     * Cron 실행 때는 limit가 0이므로 전체 조회
     */
    if (Number(limit) > 0) {
        userQuery = userQuery.limit(
            Number(limit),
        )
    }

    const users =
        await userQuery.lean()

    if (users.length === 0) {
        return {
            weekStartDate,
            weekEndDate,

            targetCount: 0,
            successCount: 0,
            failureCount: 0,
            skippedCount: 0,

            successes: [],
            failures: [],
            skippedUsers: [],
        }
    }

    /*
     * 중복 그룹 ID 제거
     *
     * 같은 그룹에 회원이 여러 명 있어도
     * 그룹 정보는 한 번만 조회합니다.
     */
    const [
        groupDocuments,
        weeklyStudyResults,
    ] = await Promise.all([
        /*
         * 휴면 그룹을 제외한 모든 일반 그룹을
         * groupTime 내림차순으로 조회
         */
        groupRepository
            .getGroupsByTimeDesc(),

        /*
         * 이번 주 사용자별 공부시간 합계
         */
        studyRepository
            .getWeeklyStudyTimeByUSers(
                weekStartDate,
                weekEndDate,
            ),
    ])

    /*
     * Mongoose Document를 일반 객체로 변환
     */
    const groups =
        groupDocuments.map((group) =>
            typeof group.toObject ===
                "function"
                ? group.toObject()
                : group,
        )

    /*
     * groupId로 빠르게 그룹 정보를 찾기 위한 Map
     */
    const groupMap = new Map(
        groups.map((group) => [
            String(group._id),
            group,
        ]),
    )

    /*
     * userId로 빠르게 주간 공부시간을 찾기 위한 Map
     *
     * totalStudyTime은 초 단위입니다.
     */
    const studyTimeMap = new Map(
        weeklyStudyResults.map(
            (studyResult) => [
                String(studyResult._id),

                Number(
                    studyResult.totalStudyTime,
                ) || 0,
            ],
        ),
    )

    const mailTargets = []
    const skippedUsers = []

    /*
     * 회원별 메일 발송 데이터 생성
     */
    for (const user of users) {
        const group =
            groupMap.get(
                String(user.groupId),
            )

        if (!group) {
            skippedUsers.push({
                userId:
                    String(user._id),

                nickname:
                    user.nickname,

                reason:
                    "소속 그룹 정보를 찾을 수 없습니다.",
            })

            continue
        }

        const weeklyStudySeconds =
            studyTimeMap.get(
                String(user._id),
            ) || 0

        const goalStatuses =
            buildTimeGoalStatuses(
                group.goals,
                weeklyStudySeconds,
            )
        /*
        * 현재 그룹 대표 목표
        */
        const currentMainGoal =
            getPrimaryTimeGoal(
                goalStatuses,
            )

        /*
         * 현재 그룹 대표 목표 달성 여부
         */
        const currentGoalAchieved =
            currentMainGoal?.isAchieved === true

        /*
         * 현재 그룹 목표를 달성했을 때만
         * 다음 상위 그룹의 목표를 계산합니다.
         */
        const nextGroupGoalPreview =
            currentGoalAchieved
                ? buildNextGroupGoalPreview({
                    groups,
                    currentGroup: group,
                    weeklyStudySeconds,
                })
                : null

        const hasNoGoals =
            !Array.isArray(group.goals) ||
            group.goals.length === 0

        let assignmentPreview = null

        if (hasNoGoals) {
            assignmentPreview =
                buildAssignmentPreview(
                    groups,
                    weeklyStudySeconds,
                )
        }

        if (
            !hasNoGoals &&
            goalStatuses.length === 0
        ) {
            skippedUsers.push({
                userId:
                    String(user._id),

                nickname:
                    user.nickname,

                reason:
                    "그룹에는 목표가 있지만 공부시간 목표는 없습니다.",
            })

            continue
        }

        mailTargets.push({
            user,
            group,

            weeklyStudySeconds,

            weeklyStudyHours:
                roundToTwo(
                    weeklyStudySeconds /
                    3600,
                ),

            goalStatuses,

            currentMainGoal,

            currentGoalAchieved,

            nextGroupGoalPreview,

            assignmentPreview,
        })
    }

    /*
     * 회원별 메일 발송 Promise 생성
     */
    const mailRequests =
        mailTargets.map(
            async (target) => {
                const {
                    user,
                    group,
                    weeklyStudyHours,
                    goalStatuses,
                    currentGoalAchieved,
                    nextGroupGoalPreview,
                    assignmentPreview,
                } = target

                if (!user.email) {
                    throw new Error(
                        `${user.nickname} 회원의 이메일이 없습니다.`,
                    )
                }

                const template =
                    getWeeklyGoalMailTemplate({
                        nickname:
                            user.nickname,

                        groupName:
                            group.groupName,

                        weekStartDate,
                        weekEndDate,

                        weeklyStudyHours,

                        goals:
                            goalStatuses,

                        currentGoalAchieved,

                        nextGroupGoalPreview,

                        assignmentPreview,
                    })

                /*
                 * testRecipient가 있으면 실제 회원 이메일 대신
                 * 테스트 이메일로 전송합니다.
                 */
                const recipient =
                    testRecipient ||
                    user.email

                await transporter.sendMail({
                    from: {
                        name:
                            process.env
                                .MAIL_FROM_NAME ||
                            "Mollip",

                        address:
                            process.env
                                .MAIL_FROM_ADDRESS ||
                            process.env
                                .MAIL_USER,
                    },

                    to: recipient,

                    subject:
                        template.subject,

                    text:
                        template.text,

                    html:
                        template.html,
                })

                return {
                    userId:
                        String(user._id),

                    nickname:
                        user.nickname,

                    originalEmail:
                        user.email,

                    recipient,
                }
            },
        )

    /*
     * 한 회원의 메일이 실패해도
     * 나머지 회원의 메일은 계속 발송합니다.
     */
    const results =
        await Promise.allSettled(
            mailRequests,
        )

    const successes = []
    const failures = []

    results.forEach(
        (result, index) => {
            const target =
                mailTargets[index]

            const user =
                target.user

            if (
                result.status ===
                "fulfilled"
            ) {
                successes.push(
                    result.value,
                )

                return
            }

            failures.push({
                userId:
                    String(user._id),

                nickname:
                    user.nickname,

                reason:
                    result.reason?.message ||
                    "메일 발송 실패",
            })
        },
    )

    return {
        weekStartDate,
        weekEndDate,

        targetCount:
            mailTargets.length,

        successCount:
            successes.length,

        failureCount:
            failures.length,

        skippedCount:
            skippedUsers.length,

        successes,
        failures,
        skippedUsers,
    }
}