import * as authRepository from "../repository/auth.js"
import * as studyRepository from "../repository/study.js"
import * as studyController from "../controller/statistics.js"
import { getWeekRange } from "../util/date.js"
import { calculateStudyStatistics } from "../util/ratio.js"

const now = new Date()

const weekStart = new Date(now)

const day = weekStart.getDay()

const distanceFromMonday =
    day === 0 ? 6 : day - 1

weekStart.setDate(
    weekStart.getDate() - distanceFromMonday
)

weekStart.setHours(0, 0, 0, 0)

const weekEnd = new Date(weekStart)

weekEnd.setDate(
    weekEnd.getDate() + 7
)



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
            image: user.profileImg,
            totalStudyTime,
        })
    }

    return ranking.sort(
        (a, b) =>
            b.totalStudyTime - a.totalStudyTime,
    )
}