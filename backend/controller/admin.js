import * as adminRepository from "../repository/admin.js"
import * as studyRepository from "../repository/study.js"
import * as todoRepository from "../repository/todo.js"
import * as statisticsService from "../service/statisticsService.js"

import Group from "../models/Group.js"
import { getWeekRange } from "../util/date.js"
import { calculateStudyStatistics } from "../util/ratio.js"


// 관리자
// 전체 사용자 수 조회 (role: 'user'인 사용자)
export async function getUserCount(req, res) {
    try {
        const count = await adminRepository.countAllUsers()
        return res.status(200).json({
            message: "전체 사용자 수를 성공적으로 불러왔습니다.",
            count
        })
    } catch(error) {
        console.log("전체 사용자 수 조회 오류: ", error)
        return res.status(500).json({
            message: "전체 사용자 수 조회 중 오류가 발생했습니다."
        })
    }
}

// 회원 목록 조회
export async function getUsers(req, res) {
    const { search, groupId, sortBy="createdAt", sortOrder="desc", page=1, limit=15 } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const filters = { search, groupId }

    const [users, total] = await Promise.all([
        adminRepository.findUsers({
            ...filters,
            sortBy,
            sortOrder: sortOrder === "asc" ? 1 : -1,
            skip,
            limit: Number(limit)
        }),
        adminRepository.countUsers(filters)
    ])

    const groupIds = [...new Set(users.map(u => u.groupId).filter(id => id !== "Unranked"))]
    const groups = await Group.find({ _id: { $in: groupIds } })
    const groupMap = new Map(groups.map(g => [g.id.toString(), g]))

    // 이번 주(월~일) 날짜 범위 계산
    const { startDate, endDate } = getWeekRange(new Date())

    // 전체 유저의 이번 주 총 공부시간을 한 번에 집계 (분 단위)
    const weeklyStudyTimes = await studyRepository.getWeeklyStudyTimeByUSers(startDate, endDate)

    // 유저ID → 주간 공부시간으로 빠르게 조회하기 위한 Map 생성
    const weeklyTimeMap = new Map(
        weeklyStudyTimes.map(item => [item._id.toString(), item.totalStudyTime])
    )

     // 전체 유저의 이번 주 Todo 완료 현황(전체 개수/완료 개수)을 한 번에 집계
    const weeklyAchievements = await todoRepository.getWeeklyAchievementByUsers(startDate, endDate)

    // 유저ID → 목표 달성률(%)로 변환한 Map 생성
    // Todo가 하나도 없으면(totalCount === 0) 0%로 처리 (0으로 나누기 방지)
    const achievementMap = new Map(
        weeklyAchievements.map(item => [
            item._id.toString(),
            item.totalCount === 0 ? 0 : Math.round((item.completedCount / item.totalCount) * 100)
        ])
    )

    // 회원 목록에 그룹 정보, 주간 공부시간, 목표 달성률을 합쳐서 응답 형태 완성
    const usersWithGroup = users.map(u => ({
        ...u.toObject(),
        group: groupMap.get(u.groupId) || null,     // 소속 그룹 정보 (Unranked면 null)
        weeklyStudyTime: weeklyTimeMap.get(u._id.toString()) || 0,      // 이번 주 공부시간, 기록 없으면 0
        achievementRate: achievementMap.get(u._id.toString()) || 0      // 개인 목표 달성률(%), 기록 없으면 0
    }))

    console.log("[관리자] 회원 목록 조회 성공")
    
    return res.status(200).json({
        message: "회원 목록을 성공적으로 불러왔습니다",
        users: usersWithGroup,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        }
    })
}

// 회원 상세 목록 조회
export async function getUserDetail(req, res) {
    const { id } = req.params

    let user
    try {
        user = await adminRepository.findUserDetail(id)
    } catch (err) {
        return res.status(400).json({ message: "잘못된 회원 ID 형식입니다." })
    }

    if (!user) {
        return res.status(404).json({ message: "존재하지 않는 회원입니다." })
    }

    const group = user.groupId !== "Unranked"
        ? await Group.findById(user.groupId)
        : null
    
    const studyRecords = await studyRepository.getAllByUserId(id)
    const totalStudyTime = studyRecords.reduce((sum, r) => sum + (r.sumStudyTime || 0), 0)

    console.log("[관리자] 회원 상세 조회 성공!")
    return res.status(200).json({
        message: "회원 상세 정보를 성공적으로 불러왔습니다.",
        user,
        group,
        totalStudyTime
    })
}


// 그룹별 주간 Todo 달성률
export async function getGroupTodoAchievement(req, res) {
    const { date } = req.query

    if (!date) {
        return res.status(400).json({
            message: "date를 입력해주세요."
        })
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/

    if (!datePattern.test(date)) {
        return res.status(400).json({
            message: "date는 YYYY-MM-DD 형식으로 입력해주세요."
        })
    }

    try {
        const result = await statisticsService.getGroupTodoAchievementRanking(date)
        return res.status(200).json(result)

    } catch (error) {
        console.error("그룹별 Todo 달성률 조회 오류:", error)
        return res.status(500).json({message: "그룹별 Todo 달성률을 불러오지 못했습니다."})
    }
}


// 전체 사용자 이번주 Todo 달성률
export async function getWeeklyTodoAchievement(req, res) {
    try{
        const achievement = await statisticsService.getWeeklyTodoAchievement()
        return res.status(200).json({
            message:"이번 주 전체 Todo 달성률을 성공적으로 불러왔습니다.",
            achievement
        })

    }catch(error){
        console.error("이번주 전체 Todo 달성률 조회 실패: ", error)
        return res.status(500).json({message: "이번주 전체 Todo 달성률을 불러오지 못했습니다."})
    }
}

// 현재 공부 중인 전체 유저 ID 목록 조회
export async function getActiveUsers(req, res) {
    try {
        const activeUserIds = await adminRepository.getActiveUserIds()
        return res.status(200).json({
            message: "현재 공부 중인 유저 목록을 성공적으로 불러왔습니다.",
            activeUserIds
        })
    } catch (error) {
        console.error("활성 유저 조회 오류:", error)
        return res.status(500).json({
            message: "활성 유저 조회 중 오류가 발생했습니다."
        })
    }
}

export async function getWeeklyGroupStudySummary(
    req,
    res,
) {
    try {
        const result =
            await statisticsService.getWeeklyGroupStudySummary()

        return res.status(200).json({
            message:
                "그룹별 주간 공부시간을 불러왔습니다.",
            ...result,
        })
    } catch (error) {
        console.error(
            "그룹별 주간 공부시간 조회 실패:",
            error,
        )

        return res.status(500).json({
            message:
                "그룹별 주간 공부시간 조회 중 오류가 발생했습니다.",
        })
    }
}