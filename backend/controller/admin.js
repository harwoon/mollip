import * as adminRepository from "../repository/admin.js"
import * as studyRepository from "../repository/study.js"
import * as todoRepository from "../repository/todo.js"
import * as statisticsService from "../service/statisticsService.js"

import AdminLog from "../models/AdminLog.js"
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

export async function getUsers(req, res) {
    const {
        search, groupId, status,
        sortBy = "createdAt", sortOrder = "desc",
        page = 1, limit = 10
    } = req.query

    // 1. 검색/그룹 조건에 맞는 유저를 전부 가져옴 (아직 정렬/페이지 안 나눔)
    const users = await adminRepository.findAllMatchingUsers({ search, groupId })

    // 2. 소속 그룹 정보 매핑용 Map 생성 (groupId -> Group 문서)
    const groupIds = [...new Set(users.map(u => u.groupId).filter(id => id !== "Unranked"))]
    const groups = await Group.find({ _id: { $in: groupIds } })
    const groupMap = new Map(groups.map(g => [g.id.toString(), g]))

    // 3. 이번 주(월~일) 날짜 범위
    const { startDate, endDate } = getWeekRange(new Date())

    // 4. 정렬/필터에 필요한 계산값들을 전체 유저 기준으로 미리 집계
    //    (검색된 유저 각각이 아니라 전체를 한 번에 계산해서, 나중에 정렬해도 결과가 정확함)
    const weeklyStudyTimes = await studyRepository.getWeeklyStudyTimeByUSers(startDate, endDate)
    const weeklyTimeMap = new Map(
        weeklyStudyTimes.map(item => [item._id.toString(), item.totalStudyTime])
    )

    const weeklyAchievements = await todoRepository.getWeeklyAchievementByUsers(startDate, endDate)
    const achievementMap = new Map(
        weeklyAchievements.map(item => [
            item._id.toString(),
            item.totalCount === 0 ? 0 : Math.round((item.completedCount / item.totalCount) * 100)
        ])
    )

    // 실시간 공부중 상태 (Redis 기준)
    const activeUserIds = new Set(await adminRepository.getActiveUserIds())

    // 5. 검색된 유저들에 그룹정보/계산값 병합
    let enrichedUsers = users.map(u => ({
        ...u.toObject(),
        group: groupMap.get(u.groupId) || null,
        weeklyStudyTime: weeklyTimeMap.get(u._id.toString()) || 0,
        achievementRate: achievementMap.get(u._id.toString()) || 0,
        isStudying: activeUserIds.has(u._id.toString())
    }))

    // 6. 상태 필터 (셀렉트박스에서 '상태' 선택 시에만 적용, 그 외엔 무시됨)
    if (status === "studying") {
        enrichedUsers = enrichedUsers.filter(u => u.isStudying)
    } else if (status === "resting") {
        enrichedUsers = enrichedUsers.filter(u => !u.isStudying)
    }

    // 7. 정렬
    // DB 필드(닉네임, 가입일 등)든 계산값(공부시간, 달성률)이든 상관없이
    // sortBy로 넘어온 필드명 그대로 비교해서 정렬 (JS에서 처리)
    enrichedUsers.sort((a, b) => {
        const dir = sortOrder === "asc" ? 1 : -1
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        if (aVal < bVal) return -1 * dir
        if (aVal > bVal) return 1 * dir
        return 0
    })

    // 8. 정렬 끝난 결과에서 요청한 페이지만 잘라내기
    const total = enrichedUsers.length
    const skip = (Number(page) - 1) * Number(limit)
    const pagedUsers = enrichedUsers.slice(skip, skip + Number(limit))

    console.log("[관리자] 회원 목록 조회 성공")

    return res.status(200).json({
        message: "회원 목록을 성공적으로 불러왔습니다",
        users: pagedUsers,
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

// 가입 탈퇴 로그 가져오기
export async function getLog(req,res) {
    try {

        const data = await adminRepository.getAllLog()

        return res.status(200).json(data)
        
    } catch (error) {
        console.error("최근 활동 로그 가져오기 실패:",error,)

        return res.status(500).json({message:"최근 활동 로그 가져오던 중 오류가 발생했습니다.",})
    }
}