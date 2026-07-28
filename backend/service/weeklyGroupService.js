import * as groupRepository from "../repository/group.js"
import * as studyRepository from "../repository/study.js"
import * as authRepository from "../repository/auth.js"
import { getWeekRange } from "../util/date.js"


export async function assignWeeklyGroups() {
    const {
        startOfWeek,
        endOfWeek,
    } = getWeekRange()

    const weeklyStudies = await studyRepository.getWeeklyStudyTimeByUSers(
        startOfWeek,
        endOfWeek
    )

    const groups = await groupRepository.getGroupsByTimeDesc()

    const users = await authRepository.getAllUsers()

    if (groups.length === 0) {
        throw new Error("등록된 그룹이 없습니다.")
    }

    const studyTimeMap = new Map(
        weeklyStudies.map((study) => [
            String(study._id),
            study.totalStudyTime
        ])
    )

    const updates = []

    for (const user of users) {
        const totalStudyTime = studyTimeMap.get(String(user._id)) ?? 0


        const mastchedGroup = groups.find(
            (group) => totalStudyTime >= group.groupTime
        )
        if (!mastchedGroup) {
            continue
        }

        updates.push({
            userId: user._id,
            groupId: mastchedGroup._id,
        })
    }

    const result = await authRepository.updateUserGroups(updates)

    return {
        startOfWeek,
        endOfWeek,
        totalUserCount:users.length,
        studyUserCount:weeklyStudies.length,
        updateUserCount:updates.length,
        result,
    }
}