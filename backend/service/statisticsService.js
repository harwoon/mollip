import dayjs from "dayjs"

import * as authRepository from "../repository/auth.js"
import * as studyRepository from "../repository/study.js"
import * as todoRepository from "../repository/todo.js"
import * as groupRepository from "../repository/admin.js"
import * as adminRepository from "../repository/admin.js"

import { getWeekRange } from "../util/date.js"
import { calculateStudyStatistics } from "../util/ratio.js"
import { calculateWeeklyStudyTimeByGroup } from "../util/ratio.js"

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
    // 로그인 사용자의 그룹을 찾음
    const loginUser =
        await authRepository.getUserGroup(userId)

    // 같은 그룹의 사용자 목록
    const groupUsers =
        await authRepository.getUsersByGroupId(
            loginUser.groupId,
        )

    const { startDate, endDate } =
        getWeekRange(new Date())

    const ranking = []

    for (const user of groupUsers) {
        // 반드시 현재 그룹원의 ID 사용
        const studies =
            await studyRepository.getWeeklyByUserIdAndDate(
                user._id,
                startDate,
                endDate,
            )

        const { totalStudyTime } =
            await calculateStudyStatistics(
                studies,
                user._id,
            )

        ranking.push({
            userId: user._id,
            nickname: user.nickname,
            profileImg: user.profileImg,
            streak: user.currentStreak,
            totalStudyTime,
        })
    }

    return ranking.sort(
        (a, b) =>
            b.totalStudyTime - a.totalStudyTime ||
            b.streak - a.streak
    )
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
// 전체 사용자 주간 Todo 달성률
export async function getWeeklyTodoAchievement() {
    const { startDate, endDate } = getWeekRange(new Date())

    // 사용자별 이번주 Todo 전체개수, 완료계수 집계
    const weeklyAchievements = await todoRepository.getWeeklyAchievementByUsers(
        startDate,
        endDate
    )

    // 확인용 로그
    console.log("이번 주 조회 기간:", startDate, endDate)
    console.log("사용자별 Todo 집계:", weeklyAchievements)

    let totalCount = 0
    let completedCount = 0

    // 사용자별 집계값을 전체 기준으로 합산
    weeklyAchievements.forEach(achievement => {
        totalCount += achievement.totalCount || 0
        completedCount += achievement.completedCount || 0
    })

    // Todo 하나도 없으면 0 처리
    const achievementRate = totalCount === 0 ? 0 : Number(
        (completedCount / totalCount * 100).toFixed(1)  // 소수점 첫째자리까지 표현
    )

    return {
        startDate,
        endDate,
        totalCount,
        completedCount,
        achievementRate
    }
}