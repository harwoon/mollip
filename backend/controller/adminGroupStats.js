import * as statisticsService from "../service/statisticsService.js"
import * as adminGroupStatisticsService from "../service/adminGroupStatisticsService.js"

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
        console.error("그룹별 Todo 달성률 조회 오류: ", error)
        return res.status(500).json({ message: "그룹별 Todo 달성률을 불러오지 못했습니다." })
    }
}

// 그룹별 주간 공부시간
export async function getWeeklyGroupStudySummary(req, res) {
    try {
        const result = await statisticsService.getWeeklyGroupStudySummary()

        return res.status(200).json({
            message:
                "그룹별 주간 공부시간을 불러왔습니다.",
            ...result,
        })
    } catch (error) {
        console.error("그룹별 주간 공부시간 조회 실패: ",error)

        return res.status(500).json({
            message: "그룹별 주간 공부시간 조회 중 오류가 발생했습니다."
        })
    }
}

// 그룹별 인원, 평균 목표 달성률, 평균 공부시간, 평균 학습일 조회
export async function getGroupStatistics(req, res) {
    try {
        const result = await adminGroupStatisticsService.getGroupStatistics()

        return res.status(200).json({
            message: "그룹별 통계를 성공적으로 불러왔습니다.", ...result
        })
    } catch (error) {
        console.error("그룹별 통계 조회 오류:", error)

        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message:
                statusCode === 500
                    ? "그룹별 통계 조회 중 오류가 발생했습니다."
                    : error.message
        })
    }
}

export async function getGroupMembers(req, res) {
    try {
        const result = await adminGroupStatisticsService
            .getGroupMembersGoalStatus(req.params.id)

        return res.status(200).json(result)
    } catch (error) {
        console.error("그룹 회원 조회 오류:", error)
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            message: statusCode === 500
                ? "그룹 회원 조회 중 오류가 발생했습니다."
                : error.message,
        })
    }
}
