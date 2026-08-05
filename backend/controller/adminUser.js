import * as adminRepository from "../repository/admin.js"
import * as studyRepository from "../repository/study.js"
import * as todoRepository from "../repository/todo.js"
import * as adminGroupStatisticsService from "../service/adminGroupStatisticsService.js"

import Group from "../models/Group.js"
import Study from "../models/Study.js"
import Subject from "../models/Subject.js"
import mongoose from "mongoose"
import { getWeekRange, getWeekOfMonth } from "../util/date.js"
import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek.js"

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

// 회원 목록 조회 (엑셀 다운로드용, 페이지네이션 없음)
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


dayjs.extend(isoWeek)

export async function getUserStudyTrend(req, res) {
    const { type, start, end, userid } = req.query

    const startDate = dayjs(start)
    const endDate = dayjs(end)

    if (type === "daily" && endDate.diff(startDate, "day") > 14) {
        return res.status(400).json({
            success: false,
            message: "일간 조회는 최대 14일까지만 가능합니다."
        })
    }

    if (type === "weekly" && endDate.diff(startDate, "month", true) > 3) {
        return res.status(400).json({
            success: false,
            message: "주간 조회는 최대 3개월까지만 가능합니다."
        })
    }

    try {
        const studies = await Study.find({
            user: new mongoose.Types.ObjectId(userid),
            studyDate: { $gte: start, $lte: end }
        })

        const groupedData = {}

        studies.forEach(record => {
            const date = dayjs(record.studyDate)
            let label = ""

            if (type === "daily") {
                label = date.format("MM.DD")
            } else if (type === "weekly") {
                const startOfWeek = date.startOf("isoWeek").format("MM.DD")
                const endOfWeek = date.endOf("isoWeek").format("MM.DD")
                label = `${startOfWeek} ~ ${endOfWeek}`
            } else if (type === "monthly") {
                label = date.format("YYYY.MM")
            }

            if (!groupedData[label]) {
                groupedData[label] = 0
            }
            groupedData[label] += record.sumStudyTime
        })

        const chartData = Object.keys(groupedData)
            .map(label => ({
                label,
                studyTime: Number((groupedData[label] / 60).toFixed(1))
            }))
            .sort((a, b) => a.label.localeCompare(b.label))

        return res.status(200).json({
            success: true,
            data: chartData
        })

    } catch (error) {
        console.error("총 공부 통계 조회 실패:", error)
        return res.status(500).json({ message: "서버 오류가 발생했습니다." })
    }
}

export async function getUserSubjectTrend(req, res) {
    const { type, start, end, userid } = req.query

    const startDate = dayjs(start)
    const endDate = dayjs(end)

    if (type === "daily" && endDate.diff(startDate, "day") > 14) {
        return res.status(400).json({
            success: false,
            message: "일간 조회는 최대 14일까지만 가능합니다."
        })
    }

    if (type === "weekly" && endDate.diff(startDate, "month", true) > 3) {
        return res.status(400).json({
            success: false,
            message: "주간 조회는 최대 3개월까지만 가능합니다."
        })
    }

    try {
        const userObjectId = new mongoose.Types.ObjectId(userid)
        const [studies, subjects] = await Promise.all([
            Study.find({
                user: userObjectId,
                studyDate: { $gte: start, $lte: end }
            }),
            Subject.find({
                user: userObjectId
            })
        ])

        const colorMap = {}
        subjects.forEach(sub => {
            colorMap[sub.subjectName] = sub.subjectColor
        })

        const subjectTotals = {}
        let totalStudySeconds = 0

        studies.forEach(record => {
            const subject = record.studyTitle

            if (!subjectTotals[subject]) {
                subjectTotals[subject] = 0
            }

            subjectTotals[subject] += record.sumStudyTime
            totalStudySeconds += record.sumStudyTime
        })

        const chartData = Object.entries(subjectTotals)
            .map(([subject, totalSeconds]) => {

                const ratio = totalStudySeconds > 0
                    ? Number(((totalSeconds / totalStudySeconds) * 100).toFixed(1))
                    : 0;

                return {
                    subject: subject,
                    studyTime: Number((totalSeconds / 60).toFixed(1)),
                    subjectColor: colorMap[subject] || "#cccccc",
                    ratio: ratio
                }
            })
            .sort((a, b) => b.studyTime - a.studyTime)

        return res.status(200).json({
            success: true,
            data: chartData
        })

    } catch (error) {
        console.error("과목별 공부 합계 조회 실패:", error)
        return res.status(500).json({
            success: false,
            message: "서버 오류로 인해 통계를 불러오지 못했습니다."
        })
    }
}

// 개인 Todo 달성률 추이
export async function getUserTodoAchievementTrend(req, res) {
    const { userId } = req.params
    const { type, start, end } = req.query

    if (!userId || !type || !start || !end) {
        return res.status(400).json({
            success: false,
            message: "userId, type, start, end를 모두 입력해주세요."
        })
    }

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
            success: false,
            message: "잘못된 회원 ID 형식입니다."
        })
    }

    if (!["daily", "weekly", "monthly"].includes(type)) {
        return res.status(400).json({
            success: false,
            message: "type은 daily, weekly, monthly 중 하나여야 합니다."
        })
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/

    if (!datePattern.test(start) || !datePattern.test(end)) {
        return res.status(400).json({
            success: false,
            message: "날짜는 YYYY-MM-DD 형식으로 입력해주세요."
        })
    }

    const startDate = dayjs(start)
    const endDate = dayjs(end)

    // 실제로 존재하는 날짜인지 확인
    if (
        !startDate.isValid() ||
        !endDate.isValid() ||
        startDate.format("YYYY-MM-DD") !== start ||
        endDate.format("YYYY-MM-DD") !== end
    ) {
        return res.status(400).json({
            success: false,
            message: "올바른 날짜를 입력해주세요."
        })
    }

    // 시작일이 종료일보다 뒤인 경우
    if (startDate.isAfter(endDate, "day")) {
        return res.status(400).json({
            success: false,
            message: "시작일은 종료일보다 늦을 수 없습니다."
        })
    }

    // 일간 최대 14일(시작, 종료일 포함) 날짜 차이 13일 + 시작일 포함 = 총 14일
    const inclusiveDayCount =
        endDate.diff(startDate, "day") + 1

    if (type === "daily" && inclusiveDayCount > 14) {
        return res.status(400).json({
            success: false,
            message: "일간 조회는 최대 14일까지 가능합니다."
        })
    }

    // 주간 최대 3개월
    if (
        type === "weekly" &&
        endDate.isAfter(startDate.add(3, "month"), "day")
    ) {
        return res.status(400).json({
            success: false,
            message: "주간 조회는 최대 3개월까지 가능합니다."
        })
    }

    try {
        // Repository에서 실제 Todo 기록 일간·주간·월간 기준으로 집계
        const result = await todoRepository.getUserTodoAchievementTrend(userId, type, start, end)

        // 실제 Todo가 없는 날짜·주·월 차트에 0%표시
        const resultMap = new Map()

        result.forEach((item) => {
            let key

            if (type === "daily") {
                key = item._id
            } else if (type === "weekly") {
                key = `${item._id.year}-${item._id.week}`
            } else {
                key = item._id
            }

            resultMap.set(key, item)
        })

        const chartData = []

        // 일간 차트 데이터
        if (type === "daily") {
            let currentDate = startDate.startOf("day")

            while (
                currentDate.isBefore(endDate, "day") ||
                currentDate.isSame(endDate, "day")
            ) {
                const dateKey = currentDate.format("YYYY-MM-DD")

                const achievement = resultMap.get(dateKey)

                chartData.push({
                    date: dateKey,
                    label: currentDate.format("MM.DD"),
                    totalCount:
                        achievement?.totalCount ?? 0,
                    completedCount:
                        achievement?.completedCount ?? 0,
                    achievementRate:
                        achievement?.achievementRate ?? 0
                })

                currentDate = currentDate.add(1, "day")
            }
        }

        // 주간 차트 데이터
        else if (type === "weekly") {
            let currentWeek = startDate.startOf("isoWeek")

            const lastWeek = endDate.startOf("isoWeek")

            while (
                currentWeek.isBefore(lastWeek, "week") ||
                currentWeek.isSame(lastWeek, "week")
            ) {
                const isoYear = currentWeek.isoWeekYear()

                const isoWeekNumber = currentWeek.isoWeek()

                const weekKey = `${isoYear}-${isoWeekNumber}`

                const achievement = resultMap.get(weekKey)

                const weekStart = currentWeek
                const weekEnd = currentWeek.endOf("isoWeek")

                chartData.push({
                    year: isoYear,
                    week: isoWeekNumber,
                    startDate: weekStart.format("YYYY-MM-DD"),
                    endDate: weekEnd.format("YYYY-MM-DD"),
                    label:
                        `${weekStart.format("MM.DD")} ~ ` +
                        `${weekEnd.format("MM.DD")}`,
                    totalCount: achievement?.totalCount ?? 0,
                    completedCount: achievement?.completedCount ?? 0,
                    achievementRate: achievement?.achievementRate ?? 0
                })

                currentWeek = currentWeek.add(1, "week")
            }
        }

        // 월간 차트 데이터
        else if (type === "monthly") {
            let currentMonth = startDate.startOf("month")

            const lastMonth = endDate.startOf("month")

            while (
                currentMonth.isBefore(lastMonth, "month") ||
                currentMonth.isSame(lastMonth, "month")
            ) {
                const monthKey = currentMonth.format("YYYY-MM")

                const achievement = resultMap.get(monthKey)

                chartData.push({
                    month: monthKey,
                    label: currentMonth.format("YYYY.MM"),
                    totalCount: achievement?.totalCount ?? 0,
                    completedCount: achievement?.completedCount ?? 0,
                    achievementRate: achievement?.achievementRate ?? 0
                })

                currentMonth = currentMonth.add(1, "month")
            }
        }

        return res.status(200).json({
            success: true,
            type,
            period: {
                startDate: start,
                endDate: end
            },
            data: chartData
        })
    } catch (error) {
        console.error("관리자 회원 Todo 달성률 추이 조회 오류:", error)

        return res.status(500).json({
            success: false,
            message: "회원 Todo 달성률 추이를 불러오는 중 오류가 발생했습니다."
        })
    }
}