import dayjs from "dayjs"

import * as subjectRepository from "../repository/subject.js"
import * as authRepository from "../repository/auth.js"
import * as studyRepository from "../repository/study.js"
import * as todoRepository from "../repository/todo.js"
import * as groupRepository from "../repository/admin.js"
import * as adminRepository from "../repository/admin.js"

import { getWeekRange, getStudyPeriodRanges, addDays } from "../util/date.js"
import { calculateStudyStatistics } from "../util/ratio.js"
import { calculateWeeklyStudyTimeByGroup } from "../util/ratio.js"

const SUBJECT_FALLBACK_COLORS = [
    "#E8C4E8",
    "#FFDDB8",
    "#BFEAD9",
    "#C8E4F5",
    "#A99AD3",
    "#F4C7C3",
]

// 현재 기간과 이전 기간 비교
function calculateComparison(
    currentTotal,
    previousTotal,
) {
    if (
        currentTotal === 0 &&
        previousTotal === 0
    ) {
        return {
            status: "same",
            rate: 0,
        }
    }

    // 이전 기록이 없으면 퍼센트를 계산할 수 없음
    if (previousTotal === 0) {
        return {
            status: "new",
            rate: null,
        }
    }

    const differenceRate =
        (
            (currentTotal - previousTotal) /
            previousTotal
        ) * 100

    if (differenceRate === 0) {
        return {
            status: "same",
            rate: 0,
        }
    }

    return {
        status:
            differenceRate > 0
                ? "up"
                : "down",

        // 화면에는 절댓값 표시
        rate: Math.round(
            Math.abs(differenceRate),
        ),
    }
}

// const now = new Date()

// const weekStart = new Date(now)

// const day = weekStart.getDay()

// const distanceFromMonday =
//     day === 0 ? 6 : day - 1

// weekStart.setDate(
//     weekStart.getDate() - distanceFromMonday
// )

// weekStart.setHours(0, 0, 0, 0)

// const weekEnd = new Date(weekStart)

// weekEnd.setDate(
//     weekEnd.getDate() + 7
// )


export async function getWeeklyGroupRanking(userId) {
    // 1. 로그인 사용자 그룹 조회
    const loginUser =
        await authRepository.getUserGroup(userId)

    if (!loginUser?.groupId) {
        return []
    }

    // 2. 같은 그룹 사용자 한 번에 조회
    const groupUsers =
        await authRepository.getUsersByGroupId(
            loginUser.groupId,
        )

    if (groupUsers.length === 0) {
        return []
    }

    const { startDate, endDate } =
        getWeekRange(new Date())

    // 3. 그룹 사용자 ID
    const userIds =
        groupUsers.map((user) => user._id)

    // 4. 그룹원 전체 공부시간 한 번에 집계
    const weeklySummaries =
        await studyRepository
            .findWeeklyStudySummariesByUsers(
                userIds,
                startDate,
                endDate,
            )

    // 5. 사용자별 공부시간 Map
    const studyTimeMap = new Map(
        weeklySummaries.map((summary) => [
            String(summary.userId),
            Number(summary.weeklyStudySeconds) || 0,
        ]),
    )

    // 6. 랭킹 데이터 생성
    const ranking =
        groupUsers.map((user) => ({
            userId: user._id,
            nickname: user.nickname,
            profileImg: user.profileImg,
            streak:
                Number(user.currentStreak) || 0,

            totalStudyTime:
                studyTimeMap.get(
                    String(user._id),
                ) || 0,
        }))

    // 7. 공부시간 → 스트릭 순으로 정렬
    ranking.sort(
        (a, b) =>
            b.totalStudyTime -
                a.totalStudyTime ||
            b.streak - a.streak,
    )

    return ranking
}

// 주간 개인 및  그룹 Todo 달성률 비교
export async function getWeeklyTodoCompareStats(userId, date) {

    // 로그인 사용자, 그룹 조회
    const loginUser = await authRepository.getUserGroup(userId)
    if (!loginUser) {
        throw new Error("사용자 정보를 찾을 수 없습니다.")
    }

    // 같은 그룹 사용자 조회
    const groupUsers = await authRepository.getUsersByGroupId(
        loginUser.groupId
    )
    if (groupUsers.length === 0) {
        return []
    }

    const { startDate, endDate } = getWeekRange(date)
    const groupUserIds = groupUsers.map(user => user._id)

    // 그룹원 전체 일주일 Todo 조회
    const todoLists = await todoRepository.getWeeklyTodoListsByUsers(
        groupUserIds,
        startDate,
        endDate
    )

    // key: 사용자ID_2026-07-30
    // value : {totalCount: 3, completedCount: 2}
    const achievementMap = new Map()

    todoLists.forEach(todoList => {
        const key = `${todoList.user.toString()}_${todoList.todoDate}`

        const todos = Array.isArray(todoList.todo) ? todoList.todo : []

        const totalCount = todos.length

        const completedCount = todos.filter(todo => todo.state === true).length

        achievementMap.set(key, {
            totalCount,
            completedCount
        })
    })

    // 달성률 계산 함수
    function calculateAchievementRate(totalCount, completedCount) {
        if (totalCount === 0) {
            return 0
        }
        return Number(
            (completedCount / totalCount * 100).toFixed(1)
        )
    }

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

    const result = []

    let currentDate = dayjs(startDate)

    // 월요일부터 일요일까지 7일
    for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.format("YYYY-MM-DD")
        const day = dayNames[currentDate.day()]

        // 로그인 사용자 달성률
        const personalKey = `${userId.toString()}_${dateStr}`

        const personalData = achievementMap.get(personalKey) || {
            totalCount: 0,
            completedCount: 0
        }

        const personalRate = calculateAchievementRate(
            personalData.totalCount,
            personalData.completedCount
        )

        // 그룹원별 달성률
        const groupRates = groupUsers.map(member => {
            const memberKey = `${member._id.toString()}_${dateStr}`

            const memberData = achievementMap.get(memberKey) || {
                totalCount: 0,
                completedCount: 0
            }

            return calculateAchievementRate(
                memberData.totalCount,
                memberData.completedCount
            )
        })

        // 그룹원 개인 달성률의 평균
        const groupRate = Number(
            (groupRates.reduce(
                (sum, rate) => sum + rate, 0) / groupRates.length
            ).toFixed(1)
        )

        result.push({
            date: dateStr,
            day,
            personalRate,
            groupRate
        })

        currentDate = currentDate.add(1, "day")
    }

    return result
}

// 관리자 페이지 그룹별 주간 Todo 달성률
export async function getGroupTodoAchievementRanking(date) {
    const { startDate, endDate } = getWeekRange(date)

    // 모든 그룹과 일반 사용자 조회
    const [groups, users] = await Promise.all([
        adminRepository.findAllGroups(),
        adminRepository.getAllUsersWithGroup()
    ])

    if (groups.length === 0) {
        return []
    }

    const userIds = users.map(user => user._id)

    // 전체 사용자의 해당 주 Todo를 한 번에 조회
    const todoLists = userIds.length > 0 ? await todoRepository.getWeeklyTodoListsByUsers(
        userIds,
        startDate,
        endDate
    ) : []


    // 사용자별 주간 Todo 개수 저장
    // key: 사용자 ID
    // value: {totalCount: 5, completedCount: 3}
    const userAchievementMap = new Map()
    users.forEach(user => {
        userAchievementMap.set(user._id.toString(), {
            totalCount: 0,
            completedCount: 0
        })
    })

    todoLists.forEach(todoList => {
        const userId = todoList.user.toString()

        const todos = Array.isArray(todoList.todo) ? todoList.todo : []

        const completedCount = todos.filter(
            todo => todo.state === true
        ).length

        const currentData = userAchievementMap.get(userId) || {
            totalCount: 0,
            completedCount: 0
        }

        currentData.totalCount += todos.length
        currentData.completedCount += completedCount

        userAchievementMap.set(userId, currentData)
    })

    // 개인 주간 Todo 달성률 계산
    function calculateAchievementRate(totalCount, completedCount) {
        if (totalCount === 0) {
            return 0
        }

        return Number(
            (
                completedCount /
                totalCount *
                100
            ).toFixed(1)
        )
    }

    const result = groups.map(group => {
        const groupId = group._id.toString()

        // 현재 그룹에 속한 사용자
        const groupUsers = users.filter(user => user.groupId?.toString() === groupId)

        // 그룹원별 개인 주간 달성률
        const memberRates = groupUsers.map(user => {
            const achievementData = userAchievementMap.get(
                user._id.toString()
            ) || {
                totalCount: 0,
                completedCount: 0
            }

            return calculateAchievementRate(
                achievementData.totalCount,
                achievementData.completedCount
            )
        })

        // 개인 달성률들의 평균
        const achievementRate = memberRates.length > 0 ? Number(
            (
                memberRates.reduce((sum, rate) => sum + rate, 0) / memberRates.length
            ).toFixed(1)
        ) : 0

        return {
            groupId,
            groupName: group.groupName,
            groupColor: group.groupColor,
            memberCount: groupUsers.length,
            achievementRate
        }
    })

    // 달성률 높은 순으로 정렬
    result.sort((a, b) => {
        return (
            b.achievementRate - a.achievementRate ||
            b.memberCount - a.memberCount
        )
    })

    // 순위 추가
    return result.map((group, index) => ({
        rank: index + 1,
        ...group
    }))
}


export async function getWeeklyGroupStudySummary(
    referenceDate = new Date(),
) {
    const {
        startDate,
        endDate,
    } = getWeekRange(referenceDate)

    const [
        groups,
        users,
        weeklyStudies,
    ] = await Promise.all([
        groupRepository.findAllGroups(),
        adminRepository.findAllUserGroups(),
        studyRepository.getWeeklyStudyTimeByUSers(
            startDate,
            endDate,
        ),
    ])

    const groupStatistics =
        calculateWeeklyStudyTimeByGroup({
            groups,
            users,
            weeklyStudies,
        })

    const allGroupsTotalStudyTime =
        groupStatistics.reduce(
            (total, group) =>
                total +
                (Number(group.totalStudyTime) || 0),
            0,
        )

    return {
        startDate,
        endDate,
        allGroupsTotalStudyTime,
        groupStatistics,
    }
}
// 전체 사용자 주간 Todo 달성률 - 0806 승아수정(Todo 전주대비)
export async function getWeeklyTodoAchievement() {
    // 이번주
    const currentWeek = getWeekRange(new Date())

    // 지난주
    const previousWeek = {
        startDate: addDays(
            currentWeek.startDate, -7,
        ),
        endDate: addDays(
            currentWeek.endDate, -7,
        ),
    }

    // 이번주, 지난주 Todo집계
    const [currentAchievements, previousAchievements] = await Promise.all([
        todoRepository.getWeeklyAchievementByUsers(
            currentWeek.startDate,
            currentWeek.endDate,
        ),
        todoRepository.getWeeklyAchievementByUsers(
            previousWeek.startDate,
            previousWeek.endDate,
        ),
    ])

    // 사용자별 집계 결과 = 서비스 전체 기준으로 합산
    function calculateTotalAchievement(achievements) {
        let totalCount = 0
        let completedCount = 0

        achievements.forEach((achievement) => {
            totalCount += Number(achievement.totalCount) || 0
            completedCount += Number(achievement.completedCount) || 0
        })

        const achievementRate = totalCount === 0 ? 0 : Number(
            (
                completedCount /
                totalCount *
                100
            ).toFixed(1)
        )

        return {
            totalCount,
            completedCount,
            achievementRate
        }
    }

    const currentAchievement = calculateTotalAchievement(currentAchievements)
    const previousAchievement =calculateTotalAchievement( previousAchievements)

    // 달성률 간 차이 퍼센트로 계산
    const achievementRateDiff = Number(
        (currentAchievement.achievementRate - previousAchievement.achievementRate).toFixed(1)
    )

    return {
        startDate: currentWeek.startDate,
        endDate: currentWeek.endDate,
        totalCount: currentAchievement.totalCount,
        completedCount: currentAchievement.completedCount,
        achievementRate: currentAchievement.achievementRate,

        // 전주 대비 값
        achievementRateDiff,

        currentWeek: {
            startDate: currentWeek.startDate,
            endDate: currentWeek.endDate,
            ...currentAchievement,
        },

        previousWeek: {
            startDate: previousWeek.startDate,
            endDate: previousWeek.endDate,
            ...previousAchievement,
        },
    }
}


// 과목별 공부시간 통계
export async function getSubjectStudySummary(
    userId,
    type,
    date,
) {
    const {
        currentRange,
        previousRange,
    } = getStudyPeriodRanges(
        type,
        date,
    )

    const [
        currentStudies,
        previousStudies,
        subjectDocuments,
    ] = await Promise.all([
        studyRepository
            .getSubjectStudySummaryByRange(
                userId,
                currentRange.startDate,
                currentRange.endDate,
            ),

        studyRepository
            .getSubjectStudySummaryByRange(
                userId,
                previousRange.startDate,
                previousRange.endDate,
            ),

        subjectRepository
            .findSubjectsByUser(userId),
    ])

    /*
     * 1. 현재 기간 총 공부시간
     */
    const totalStudyTime =
        currentStudies.reduce(
            (total, subject) =>
                total +
                (
                    Number(
                        subject.sumStudyTime,
                    ) || 0
                ),
            0,
        )

    /*
     * 2. 이전 기간 총 공부시간
     */
    const previousTotalStudyTime =
        previousStudies.reduce(
            (total, subject) =>
                total +
                (
                    Number(
                        subject.sumStudyTime,
                    ) || 0
                ),
            0,
        )

    /*
     * 3. 과목 색상 Map
     */
    const colorMap = new Map(
        subjectDocuments.map((subject) => [
            subject.subjectName.trim(),
            subject.subjectColor,
        ]),
    )

    /*
     * 4. 현재 기간 과목별 비율 계산
     */
    const subjects =
        currentStudies
            .map((subject, index) => {
                const sumStudyTime =
                    Number(
                        subject.sumStudyTime,
                    ) || 0

                const ratio =
                    totalStudyTime === 0
                        ? 0
                        : Number(
                            (
                                (
                                    sumStudyTime /
                                    totalStudyTime
                                ) * 100
                            ).toFixed(2),
                        )

                return {
                    studyTitle:
                        subject.studyTitle,

                    sumStudyTime,

                    ratio,

                    subjectColor:
                        colorMap.get(
                            subject.studyTitle,
                        ) ||
                        SUBJECT_FALLBACK_COLORS[
                            index %
                            SUBJECT_FALLBACK_COLORS.length
                        ],
                }
            })
            .sort(
                (a, b) =>
                    b.sumStudyTime -
                    a.sumStudyTime,
            )

    /*
     * 5. 이전 기간 과목별 비율 계산
     */
    const previousSubjects =
        previousStudies
            .map((subject) => {
                const sumStudyTime =
                    Number(
                        subject.sumStudyTime,
                    ) || 0

                const ratio =
                    previousTotalStudyTime === 0
                        ? 0
                        : Number(
                            (
                                (
                                    sumStudyTime /
                                    previousTotalStudyTime
                                ) * 100
                            ).toFixed(2),
                        )

                return {
                    studyTitle:
                        subject.studyTitle,

                    sumStudyTime,

                    ratio,
                }
            })
            .sort(
                (a, b) =>
                    b.sumStudyTime -
                    a.sumStudyTime,
            )

    /*
     * 6. 현재 기간과 이전 기간의
     *    가장 많이 공부한 과목 선택
     */
    const currentTopSubject =
        subjects[0] || null

    const previousTopSubject =
        previousSubjects[0] || null

    /*
     * 7. 각 기간 1위 과목의 비율 비교
     */
    let topSubjectComparison = null

    if (
        currentTopSubject &&
        previousTopSubject
    ) {
        const currentRatio =
            Number(
                currentTopSubject.ratio,
            ) || 0

        const previousRatio =
            Number(
                previousTopSubject.ratio,
            ) || 0

        const difference =
            Number(
                (
                    currentRatio -
                    previousRatio
                ).toFixed(2),
            )

        let status = "same"

        if (difference > 0) {
            status = "up"
        } else if (difference < 0) {
            status = "down"
        }

        topSubjectComparison = {
            currentSubject:
                currentTopSubject.studyTitle,

            previousSubject:
                previousTopSubject.studyTitle,

            currentRatio,

            previousRatio,

            difference:
                Math.abs(difference),

            status,
        }
    }

    return {
        type,
        date,

        currentRange,
        previousRange,

        totalStudyTime,
        previousTotalStudyTime,

        comparison:
            calculateComparison(
                totalStudyTime,
                previousTotalStudyTime,
            ),

        subjects,

        topSubjectComparison,
    }
}