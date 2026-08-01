import * as adminRepository from "../repository/admin.js"
import * as studyRepository from "../repository/study.js"
import * as todoRepository from "../repository/todo.js"
import * as statisticsService from "../service/statisticsService.js"

import AdminLog from "../models/AdminLog.js"
import Group from "../models/Group.js"
import { getWeekRange } from "../util/date.js"
import { calculateStudyStatistics } from "../util/ratio.js"
import Study from '../models/Study.js'
import mongoose from 'mongoose'
import * as adminGroupStatisticsService from "../service/adminGroupStatisticsService.js"


// 관리자
// 전체 사용자 수 조회 (role: 'user'인 사용자)
export async function getUserCount(req, res) {
    try {
        const count = await adminRepository.countAllUsers()
        return res.status(200).json({
            message: "전체 사용자 수를 성공적으로 불러왔습니다.",
            count
        })
    } catch (error) {
        console.log("전체 사용자 수 조회 오류: ", error)
        return res.status(500).json({
            message: "전체 사용자 수 조회 중 오류가 발생했습니다."
        })
    }
}

// 회원 목록 조회
// export async function getUsers(req, res) {
//     const { 
//         search, groupId, status,
//         sortBy = "createdAt",
//         sortOrder = "desc",
//         page = 1, limit = 10 
//     } = req.query

//     // 1.  검색/그룹 조건에 맞는 유저를 전부 가져옴 (아직 정렬/페이지 안나눔)
//     const users = await adminRepository.findAllMatchingUsers({ search, groupId })

//     // 2. 소속 그룹 정보 매핑용 Map 생성
//     const groupIds = [...new Set(users.map(u => u.groupId).filter(id => id !== "Unranked"))]
//     const groups = await Group.find({ _id: { $in: groupIds } })
//     const groupMap = new Map(groups.map(g => [g.id.toString(), g]))

//     // 이번 주(월~일) 날짜 범위 계산
//     const { startDate, endDate } = getWeekRange(new Date())

//     // 전체 유저의 이번 주 총 공부시간을 한 번에 집계 (분 단위)
//     const weeklyStudyTimes = await studyRepository.getWeeklyStudyTimeByUSers(startDate, endDate)

//     // 유저ID → 주간 공부시간으로 빠르게 조회하기 위한 Map 생성
//     const weeklyTimeMap = new Map(
//         weeklyStudyTimes.map(item => [item._id.toString(), item.totalStudyTime])
//     )

//     // 전체 유저의 이번 주 Todo 완료 현황(전체 개수/완료 개수)을 한 번에 집계
//     const weeklyAchievements = await todoRepository.getWeeklyAchievementByUsers(startDate, endDate)

//     // 유저ID → 목표 달성률(%)로 변환한 Map 생성
//     // Todo가 하나도 없으면(totalCount === 0) 0%로 처리 (0으로 나누기 방지)
//     const achievementMap = new Map(
//         weeklyAchievements.map(item => [
//             item._id.toString(),
//             item.totalCount === 0 ? 0 : Math.round((item.completedCount / item.totalCount) * 100)
//         ])
//     )
    
//     // 현재 실시간으로 공부 중인 유저ID 목록을 Set으로 변환
//     // (Set으로 만드는 이유: 나중에 .has()로 바르게 "이 유저가 공부중인기" 확인하기 위함)
//     const activeUserIds = new Set(await adminRepository.getActiveUserIds())

//     // 검색된 유저 한 명 한 명에, 앞서 계산해둔 그룹정보/공부시간/달성률/실시간상태를 합쳐
//     // 화면에 필요한 최종 형태로 만듦 (원본 users 배열은 그대로 두고 새 배열을 만듦)
//     let enrichedUsers = users.map(user => ({
//         ...user.toObject(),
//         group: groupMap.get(user.groupId) || null,
//         weeklyStudyTime: weeklyTimeMap.get(user._id.toString()) || 0,
//         achievementRate: achievementMap.get(user._id.toString()) || 0,
//         isStudying: activeUserIds.has(user._id.toString())
//     }))

//     // 셀렉트 박스에서 '상태'를 선택했을 때만 걸리는 필터
//     if (status === "studying") {
//         enrichedUsers = enrichedUsers.filter(user => user.isStudying)
//     } else if (status === "resting") {
//         enrichedUsers = enrichedUsers.filter(user => !user.isStudying)
//     }

//     // 정렬처리
//     // '상태' 필터가 걸려있을 땐 별도 정렬 기준이 없으니, 닉네임 오름차순으로 고정 정렬
//     // 
//     if (sortBy === "status") {
//         enrichedUsers.sort((a, b) => a.nickname.localeCompare(b.nickname, "ko"))
//     } else {
//         enrichedUsers.sort((a, b) => {
//             // sortOrder가 "asc"면 1(오름차순), 아니면 -1(내림차순)
//             const dir = sortOrder === "asc" ? 1 : -1

//             // sortBy로 넘어온 필드명(예: "nickname", "weeklyStudyTime")의 값을 두 유저에서 각각 꺼냄
//             const aVal = a[sortBy]
//             const bVal = b[sortBy]
//             if (aVal < bVal) return -1 * dir
//             if (aVal > bVal) return 1 * dir
//             return 0
//         })
//     }

//     // 정렬/필터가 끝난 "전체 결과 개수"를 페이지네이션 정보로 쓰기 위해 저장
//     const total = enrichedUsers.length

//     // 몇 번째 항목부터 끊어서 보여줄지 계산 (예: page=2, limit=10 이면 skip=10 → 11번째부터)
//     const skip = (Number(page) - 1) * Number(limit)

//     // 정렬 다 끝난 전체 목록에서, 이번에 보여줄 페이지 분량만 잘라냄
//     const pagedUsers = enrichedUsers.slice(skip, skip + Number(limit))

//     console.log("[관리자] 회원 목록 조회 성공")

//     return res.status(200).json({
//         message: "회원 목록을 성공적으로 불러왔습니다",
//         users: pagedUsers,
//         pagination: {
//             total,
//             page: Number(page),
//             limit: Number(limit),
//             totalPages: Math.ceil(total / Number(limit))
//         }
//     })
// }

// 검색/필터/정렬이 적용된 전체 유저 목록을 만드는 공용 함수
// (getUsers와 엑셀 다운로드가 이 함수를 공유해서 씀 — 페이지네이션은 각자 알아서 처리)
async function buildEnrichedUsers({ search, groupId, status, sortBy, sortOrder }) {
    const users = await adminRepository.findAllMatchingUsers({ search, groupId })

    const groupIds = [...new Set(users.map(u => u.groupId).filter(id => id !== "Unranked"))]
    const groups = await Group.find({ _id: { $in: groupIds } })
    const groupMap = new Map(groups.map(g => [g.id.toString(), g]))

    const { startDate, endDate } = getWeekRange(new Date())

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

    // 그룹별 평균 목표 달성률 조회 (성욱님 통계 서비스 재사용)
    const groupStats = await adminGroupStatisticsService.getGroupStatistics()
    const groupAchievementMap = new Map(
        groupStats.groups.map(g => [g._id.toString(), g.averageGoalAchievementRate])
    )

    const activeUserIds = new Set(await adminRepository.getActiveUserIds())

    let enrichedUsers = users.map(u => ({
        ...u.toObject(),
        group: groupMap.get(u.groupId) || null,
        weeklyStudyTime: weeklyTimeMap.get(u._id.toString()) || 0,
        achievementRate: achievementMap.get(u._id.toString()) || 0,
        groupAchievementRate: u.groupId !== "Unranked"
            ? (groupAchievementMap.get(u.groupId) ?? 0)
            : null,                                       
        isStudying: activeUserIds.has(u._id.toString())
    }))

    if (status === "studying") {
        enrichedUsers = enrichedUsers.filter(u => u.isStudying)
    } else if (status === "resting") {
        enrichedUsers = enrichedUsers.filter(u => !u.isStudying)
    }

    if (sortBy === "status") {
        enrichedUsers.sort((a, b) => a.nickname.localeCompare(b.nickname, "ko"))
    } else {
        enrichedUsers.sort((a, b) => {
            const dir = sortOrder === "asc" ? 1 : -1
            const aVal = a[sortBy]
            const bVal = b[sortBy]
            if (aVal < bVal) return -1 * dir
            if (aVal > bVal) return 1 * dir
            return 0
        })
    }

    return enrichedUsers
}

// 회원 목록 조회 (화면용, 페이지네이션 적용)
export async function getUsers(req, res) {
    const {
        search, groupId, status,
        sortBy = "createdAt", sortOrder = "desc",
        page = 1, limit = 10
    } = req.query

    const enrichedUsers = await buildEnrichedUsers({ search, groupId, status, sortBy, sortOrder })

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

// 회원 목록 엑셀 다운로드용 (검색/필터된 전체, 페이지네이션 없음)
export async function getUsersExport(req, res) {
    const { search, groupId, status, sortBy = "createdAt", sortOrder = "desc" } = req.query

    try {
        const enrichedUsers = await buildEnrichedUsers({ search, groupId, status, sortBy, sortOrder })

        console.log("[관리자] 회원 목록 엑셀용 전체 조회 성공")

        return res.status(200).json({
            message: "엑셀 다운로드용 회원 목록을 성공적으로 불러왔습니다",
            users: enrichedUsers
        })
    } catch (error) {
        console.error("엑셀용 회원 목록 조회 오류:", error)
        return res.status(500).json({ message: "엑셀 다운로드용 데이터 조회 중 오류가 발생했습니다." })
    }
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
        return res.status(500).json({ message: "그룹별 Todo 달성률을 불러오지 못했습니다." })
    }
}


// 전체 사용자 이번주 Todo 달성률
export async function getWeeklyTodoAchievement(req, res) {
    try {
        const achievement = await statisticsService.getWeeklyTodoAchievement()
        return res.status(200).json({
            message: "이번 주 전체 Todo 달성률을 성공적으로 불러왔습니다.",
            achievement
        })

    } catch (error) {
        console.error("이번주 전체 Todo 달성률 조회 실패: ", error)
        return res.status(500).json({ message: "이번주 전체 Todo 달성률을 불러오지 못했습니다." })
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
export async function getLog(req, res) {
    try {

        const data = await adminRepository.getAllLog()

        return res.status(200).json(data)

    } catch (error) {
        console.error("최근 활동 로그 가져오기 실패:", error,)

        return res.status(500).json({ message: "최근 활동 로그 가져오던 중 오류가 발생했습니다.", })
    }
}

// 유저의 누적 총 공부시간 가져오기 (기간별)
export async function getTotalStudy(req, res) {
    const { type, userId, start, end } = req.query

    try {
        // 1. 검색 조건 (Match): 특정 유저의 시작일~종료일 사이의 데이터만 필터링
        const matchCondition = {
            user: new mongoose.Types.ObjectId(userId), // String을 ObjectId로 변환
            studyDate: { $gte: start, $lte: end } // 문자열 날짜("YYYY-MM-DD") 크기 비교
        }
        let groupCondition = {}

        // 2. 타입별 그룹화 조건 설정 (Group)
        if (type === 'daily') {
            // 일간: "YYYY-MM-DD" 그대로 묶기
            groupCondition = {
                _id: "$studyDate",
                totalStudyTime: { $sum: "$sumStudyTime" }
            };
        }
        else if (type === 'weekly') {
            // 주간: 문자열 날짜를 Date로 변환 후, 연도와 주차(Week) 단위로 묶기
            groupCondition = {
                _id: {
                    year: { $isoWeekYear: { $dateFromString: { dateString: "$studyDate" } } },
                    week: { $isoWeek: { $dateFromString: { dateString: "$studyDate" } } }
                },
                totalStudyTime: { $sum: "$sumStudyTime" }
            }
        }
        else if (type === 'monthly') {
            // 월간: "YYYY-MM-DD"에서 앞 7글자("YYYY-MM")만 잘라서 묶기
            groupCondition = {
                _id: { $substr: ["$studyDate", 0, 7] },
                totalStudyTime: { $sum: "$sumStudyTime" }
            };
        }
        else {
            return res.status(400).json({ message: "올바른 type을 입력해주세요 (daily, weekly, monthly)." })
        }

        // 3. MongoDB 집계(Aggregation) 실행
        const total = await Study.aggregate([
            { $match: matchCondition },  // 조건에 맞는 데이터 찾기
            { $group: groupCondition },  // 일/주/월 단위로 묶어서 합계(sum) 구하기
            { $sort: { "_id": 1 } }      // 과거 날짜부터 오름차순 정렬
        ]);

        // 4. 프론트엔드에서 바로 차트(Chart)에 그리기 쉽도록 데이터 가공
        const formattedResult = total.map(item => {
            let dateLabel = item._id;

            // 주간 데이터일 경우 _id가 객체이므로 예쁘게 텍스트로 변환
            if (type === 'weekly') {
                dateLabel = `${item._id.year}년 ${item._id.week}주차`
            }

            return {
                date: dateLabel,            // 예: "2026-07-20", "2026년 31주차", "2026-07"
                totalStudyTime: item.totalStudyTime // 초(Seconds) 단위 총합
            };
        });

        // 결과 반환
        return res.status(200).json(formattedResult)

    } catch (error) {
        console.error("유저 총 공부시간 가져오기 실패:", error);
        return res.status(500).json({ message: "유저의 총 공부시간을 가져오던 중 오류가 발생했습니다." })
    }
}

// 그룹별 인원, 평균 목표 달성률,
// 평균 공부시간, 평균 학습일 조회
export async function getGroupStatistics(req, res) {
    try {
        const result =
            await adminGroupStatisticsService
                .getGroupStatistics()

        return res.status(200).json({
            message:
                "그룹별 통계를 성공적으로 불러왔습니다.",
            ...result
        })
    } catch (error) {
        console.error(
            "그룹별 통계 조회 오류:",
            error
        )

        const statusCode =
            error.statusCode || 500

        return res.status(statusCode).json({
            message:
                statusCode === 500
                    ? "그룹별 통계 조회 중 오류가 발생했습니다."
                    : error.message
        })
    }
}