import * as groupRepository from "../repository/group.js"
import * as studyRepository from "../repository/study.js"
import * as authRepository from "../repository/auth.js"
import { getWeekRange } from "../util/date.js"


export async function assignWeeklyGroups() {
    // 지난주에 해당하는 날짜 생성
    const lastWeekDate = new Date()
    lastWeekDate.setDate(lastWeekDate.getDate() - 7)

    // 지난주의 월요일과 일요일 계산
    const {
        startDate,
        endDate,
    } = getWeekRange(lastWeekDate)

    // 지난주 사용자별 총 공부시간 조회
    const weeklyStudies =
        await studyRepository.getWeeklyStudyTimeByUSers(
            startDate,
            endDate,
        )

    // 공부시간 기준 내림차순 그룹 조회
    const groups =
        await groupRepository.getGroupsByTimeDesc()

    // 전체 사용자 조회
    const users =
        await authRepository.getAllUsers()

    if (groups.length === 0) {
        throw new Error("등록된 그룹이 없습니다.")
    }

    // 사용자 ID를 키로 하는 공부시간 Map
    const studyTimeMap = new Map(
        weeklyStudies.map((study) => [
            String(study._id),
            Number(study.totalStudyTime) || 0,
        ]),
    )

    const updates = []

    for (const user of users) {
        const totalStudyTime =
            studyTimeMap.get(String(user._id)) ?? 0

        // 조건을 만족하는 가장 높은 그룹 선택
        const matchedGroup = groups.find(
            (group) =>
                totalStudyTime >=
                Number(group.groupTime),
        )

        if (!matchedGroup) {
            continue
        }

        updates.push({
            userId: user._id,
            groupId: matchedGroup._id,
        })
    }

    const result =
        await authRepository.updateUserGroups(
            updates,
        )

    return {
        startDate,
        endDate,
        totalUserCount: users.length,
        studyUserCount: weeklyStudies.length,
        updateUserCount: updates.length,
        result,
    }
}