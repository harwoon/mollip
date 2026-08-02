import * as adminRepository from "../repository/admin.js"
import * as studyRepository from "../repository/study.js"
import * as todoRepository from "../repository/todo.js"
import * as statisticsService from "../service/statisticsService.js"

import AdminLog from "../models/AdminLog.js"
import Group from "../models/Group.js"
import { calculateStudyStatistics } from "../util/ratio.js"
import Study from '../models/Study.js'
import mongoose from 'mongoose'
import * as adminGroupStatisticsService from "../service/adminGroupStatisticsService.js"
import { getWeekOfMonth } from "../util/date.js"
import { getWeekRange, getInclusiveDayCount, getPreviousPeriod, parseDate } from "../util/date.js"


// 관리자
// 전체 사용자 수 조회 (role: 'user'인 사용자)
// totalUserCount 탈퇴하지 않은 전체 일반 회원 수
// normalUserCount 휴면 그룹을 제외한 일반 회원 수
// dormantUserCount 휴면 그룹에 속한 회원 수
export async function getUserCount(req, res) {
    try {
        const userStatusSummary = await adminRepository.countAllUsers()
        // const count = await adminRepository.countAllUsers()
        return res.status(200).json({
            message: "전체 사용자 수를 성공적으로 불러왔습니다.",
            ...userStatusSummary
            // count
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
            }
        }
        else if (type === 'weekly') {
            // 주간: 문자열 날짜를 Date로 변환 후, 연도와 주차(Week) 단위로 묶기
            groupCondition = {
                _id: {
                    year: { $isoWeekYear: { $dateFromString: { dateString: "$studyDate" } } },
                    week: { $isoWeek: { $dateFromString: { dateString: "$studyDate" } } }
                },
                totalStudyTime: { $sum: "$sumStudyTime" },
                firstDate: { $min: "$studyDate" }
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
            let dateLabel = item._id

            // 주간 데이터일 경우
            if (type === 'weekly') {
                // firstDate("YYYY-MM-DD")에서 월 추출
                const month = parseInt(item.firstDate.split('-')[1], 10)

                // 해당 월의 몇 주차인지 계산
                const weekOfMonth = getWeekOfMonth(item.firstDate)

                // 예: "2026년 7월 3주차"
                dateLabel = `${item._id.year}년 ${month}월 ${weekOfMonth}주차`
            }

            return {
                date: dateLabel,
                totalStudyTime: item.totalStudyTime
            }
        })

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

// 관리자 서비스 전체 학습시간 추이 조회
export async function getStudyTimeTrend(req, res) {
    const {type, startDate, endDate} = req.query

    // 허용하는 조회 단위
    const allowedTypes  = ["daily", "weekly", "monthly"]

    // 날짜 문자열이 YYYY-MM-DD 형식인지 검사
    const datePattern = /^\d{4}-\d{2}-\d{2}$/

    // 하나라도 없으면 요청 실패
    if (!type || !startDate || !endDate) {
        return res.status(400).json({
            message: "type, startDate, endDate를 모두 입력해주세요."
        })
    }

    // 다른 type 들어오면 요청 실패
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({
            message: "type은 daily, weekly, monthly 중 하나여야 합니다."
        })
    }

    // 시작일, 종료일 문자열 형식 검사
    if(
        !datePattern.test(startDate) ||
        !datePattern.test(endDate)
    ) {
        return res.status(400).json({
            message: "날짜는 YYYY-MM-DD 형식으로 입력해주세요."
        })
    }

    // 문자열 날짜 Date 객체 변환
    const startDateObj = parseDate(startDate)
    const endDateObj = parseDate(endDate)

    // 존재하지 않는 날짜까지 검사 (2026-02-30은 정규식으로 통과함, 별도 확인필요)
    const isValidStartDate =
        startDateObj.getFullYear() === Number(startDate.slice(0, 4)) &&
        startDateObj.getMonth() + 1 === Number(startDate.slice(5, 7)) &&
        startDateObj.getDate() === Number(startDate.slice(8, 10))

    const isValidEndDate =
        endDateObj.getFullYear() === Number(endDate.slice(0, 4)) &&
        endDateObj.getMonth() + 1 === Number(endDate.slice(5, 7)) &&
        endDateObj.getDate() === Number(endDate.slice(8, 10))

    // 존재하지 않는 날짜면 요청 실패
    if (!isValidStartDate || !isValidEndDate) {
        return res.status(400).json({
            message: "실제로 존재하는 날짜를 입력해주세요."
        })
    }

    // 시작일이 종료일보다 뒤인 경우 요청 실패
    if (startDateObj > endDateObj) {
        return res.status(400).json({
            message: "startDate는 endDate보다 늦을 수 없습니다."
        })
    }

    // 시작일과 종료일 모두 포함한 조회 기간 계산 (07-01 ~ 07-14는 14일)
    const periodDays = getInclusiveDayCount(
        startDate,
        endDate
    )

    // 일간 데이터는 최대 14일까지 조회 가능
    if (type === "daily" && periodDays > 14) {
        return res.status(400).json({
            message: "일간 조회는 최대 14일까지 가능합니다."
        })
    }

    // 주간 데이터는 최대 3개월까지 조회 가능
    if (type === "weekly") {
        // 시작일 객체를 복사 원본 날짜가 변경되지 않도록 처리
        const weeklyLimitDate = new Date(startDateObj)

        // 조회 시작일을 기준으로 3개월 뒤 날짜 계산
        weeklyLimitDate.setMonth(
            weeklyLimitDate.getMonth() + 3
        )

        // 종료일이 허용 날짜보다 뒤라면 조회 제한 초과
        if (endDateObj > weeklyLimitDate) {
            return res.status(400).json({
                message: "주간 조회는 최대 3개월까지 가능합니다."
            })
        }
    }

    try {

        // 현재 선택 기간과 동일한 일수의 이전 기간 계산
        const previousPeriod = getPreviousPeriod(startDate, endDate)

        // DB에서는 실제 공부 기록이 존재하는 구간만 조회됨
        //
        // 예:
        // 조회 기간이 07-16 ~ 07-22이고
        // 07-20에만 공부했다면 07-20 데이터만 반환
        const rawTrend =
            await studyRepository.getServiceStudyTimeTrend(
                type,
                startDate,
                endDate
            )

        // 기록이 없는 일·주·월을 totalMinutes: 0으로 채움
        const trend = fillMissingTrendData(
            type,
            startDate,
            endDate,
            rawTrend
        )

        // 현재 선택 기간의 서비스 전체 공부시간 합계
        const currentTotalMinutes =
            await studyRepository.getServiceStudyTimeTotal(
                startDate,
                endDate
            )

        // 이전 동일 기간의 서비스 전체 공부시간 합계
        const previousTotalMinutes =
            await studyRepository.getServiceStudyTimeTotal(
                previousPeriod.startDate,
                previousPeriod.endDate
            )

        // 현재 기간에서 이전 기간을 뺀 증감 공부시간
        const differenceMinutes = currentTotalMinutes - previousTotalMinutes

        // 이전 기간 합계가 0이면 나눗셈이 불가능하므로 null 반환
        const changeRate =
            previousTotalMinutes === 0 ? null : Number(
                (differenceMinutes / previousTotalMinutes * 100).toFixed(2)
            )


        return res.status(200).json({
            message: "서비스 학습시간 추이를 성공적으로 조회했습니다.",
            type,
            trend,
            currentPeriod: {
                startDate,
                endDate,
                totalMinutes: currentTotalMinutes
            },
            previousPeriod: {
                startDate: previousPeriod.startDate,
                endDate: previousPeriod.endDate,
                totalMinutes: previousTotalMinutes
            },
            comparison: {
                differenceMinutes,
                changeRate
            }
        })

    } catch (error) {
        console.error("서비스 학습시간 추이 조회 실패:", error)
        return res.status(500).json({
            message: "서비스 학습시간 추이 조회 중 오류가 발생했습니다."
        })
    }
}

// Date 객체 YYYY-MM-DD 문자열로 변환
// toISOString()을 사용하면 한국 시간과 UTC 차이 때문에 날짜가 하루 전으로 변할 수 있으므로 직접 문자열을 조합
function formatLocalDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

// YYYY-MM-DD 문자열을 로컬 Date 객체로 변환
function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(
        year,
        month - 1,
        day
    )
}

// 전달받은 날짜가 속한 주의 월요일 계산
function getMonday(date) {
    const result = new Date(date)
    const day = result.getDay()
    const differenceFromMonday = day === 0 ? 6 : day - 1

    result.setDate(
        result.getDate() - differenceFromMonday
    )
    return result
}

// 조회 단위에 맞춰 누락된 구간을 0분으로 채움
function fillMissingTrendData(type, startDate, endDate, rawTrend) {
    // "2026-07-20" → 7200
    const trendMap = new Map(
        rawTrend.map(item => [
            item.date,
            Number(item.totalMinutes) || 0
        ])
    )
    const filledTrend = []

    // 일간 조회 (기록이 없는 날짜는 totalMinutes: 0으로 추가)
    if (type === "daily") {
        const currentDate = parseLocalDate(startDate)
        const lastDate = parseLocalDate(endDate)

        while (currentDate <= lastDate) {
            const date = formatLocalDate(currentDate)
            filledTrend.push({
                date,
                totalMinutes: trendMap.get(date) || 0
            })

            currentDate.setDate(
                currentDate.getDate() + 1
            )
        }
        return filledTrend
    }

    // 주간 조회 : 시작일이 속한 주의 월요일부터 한 주씩 증가
    if (type === "weekly") {
        const currentMonday = getMonday(parseLocalDate(startDate))
        const endDateObject = parseLocalDate(endDate)

        while (currentMonday <= endDateObject) {
            const date = formatLocalDate(currentMonday)

            filledTrend.push({
                // 해당 주 월요일
                date,

                // 공부 기록이 없는 주는 0분
                totalMinutes: trendMap.get(date) || 0
            })
            currentMonday.setDate(
                currentMonday.getDate() + 7
            )
        }

        return filledTrend
    }

    // 월간 조회 : 시작 월부터 종료 월까지 한 달씩 증가
    if (type === "monthly") {
        const startDateObject = parseLocalDate(startDate)
        const endDateObject = parseLocalDate(endDate)

        const currentMonth = new Date(
            startDateObject.getFullYear(),
            startDateObject.getMonth(),
            1
        )

        const lastMonth = new Date(
            endDateObject.getFullYear(),
            endDateObject.getMonth(),
            1
        )

        while (currentMonth <= lastMonth) {
            const year = currentMonth.getFullYear()

            const month = String(
                currentMonth.getMonth() + 1
            ).padStart(2, "0")

            const date = `${year}-${month}`

            filledTrend.push({
                date,
                totalMinutes: trendMap.get(date) || 0
            })

            currentMonth.setMonth(
                currentMonth.getMonth() + 1
            )
        }

        return filledTrend
    }

    // 이미 type 검증을 하고 있지만 예외 상황에서는 원본 데이터 반환
    return rawTrend
}

// 회원현황: summary 이번주 평균 학습시간
export async function getWeeklyAverageStudyTime(req, res) {
    try{
        // 오늘날짜 기준 이번주 월요일, 일요일 계산
        const {startDate, endDate} = getWeekRange(new Date())

        // 이번주 학습기록 있는 회원별 주간 공부시간 조회
        const weeklyStudyTimes = await studyRepository.getWeeklyStudyTimeByUSers(startDate, endDate)

        // 이번주 실제 공부한 회원수
        const studyUserCount = weeklyStudyTimes.length

        // 회원별 공부시간 더해서 이번주 전체 공부시간 계산
        const totalWeeklyStudyTime = weeklyStudyTimes.reduce(
            (sum, user) => {
                return sum + (user.totalStudyTime || 0)
            },
            0
        )

        // 이번주 평균 공부시간 = 이번주 전체 공부시간 / 이번주 공부한 회원수
        // 공부한 회원 없으면 평균 0 반환
        const averageWeeklyStudyTime = studyUserCount === 0 ? 0 : Number(
            (totalWeeklyStudyTime / studyUserCount).toFixed(1)
        )

        return res.status(200).json({
            message: "이번 주 회원 평균 공부시간을 성공적으로 불러왔습니다.",
            startDate,
            endDate,
            // 이번 주에 실제 공부한 회원 수
            studyUserCount,
            // 이번 주 전체 회원 공부시간 합계 (분)
            totalWeeklyStudyTime,
            // 이번 주 공부한 회원 기준 평균 공부시간 (분)
            averageWeeklyStudyTime
        })

    }catch(error){
        console.error(
            "전체 회원 주간 평균 공부시간 조회 실패: ", error
        )

        return res.status(500).json({
            message: "전체 회원의 이번주 평균 공부시간을 불러오지 못했습니다."
        })
    }
    
}