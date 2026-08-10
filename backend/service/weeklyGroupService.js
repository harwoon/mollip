import * as groupRepository from "../repository/group.js"
import * as studyRepository from "../repository/study.js"
import * as authRepository from "../repository/auth.js"
import { getWeekRange, getCurrentWeekRange } from "../util/date.js"
import { config } from "../config.mjs"


function getGroupNoticeStatus({
    previousGroup,
    currentGroup,
    previousGroupId,
    dormantGroupId,
}) {
    if (!currentGroup) {
        return "SAME"
    }

    // 휴면 그룹에서 일반 그룹으로 돌아온 경우
    if (
        String(previousGroupId) ===
        String(dormantGroupId)
    ) {
        return "RETURN"
    }

    // 기존 그룹 정보가 없으면 비교 불가
    if (!previousGroup) {
        return "SAME"
    }

    const previousGroupTime =
        Number(previousGroup.groupTime)

    const currentGroupTime =
        Number(currentGroup.groupTime)

    if (
        currentGroupTime >
        previousGroupTime
    ) {
        return "UP"
    }

    if (
        currentGroupTime <
        previousGroupTime
    ) {
        return "DOWN"
    }

    return "SAME"
}

export async function assignWeeklyGroups() {
    // 지난주에 해당하는 날짜 생성
    const lastWeekDate = new Date()
    lastWeekDate.setDate(lastWeekDate.getDate() - 7)

    // 지난주의 월요일과 일요일 계산
    const {
        startDate,
        endDate,
    } = getWeekRange(lastWeekDate)

    // 이번 주 월요일 (알림 기준 주차)
    const {
        startDate: noticeWeekStart,
    } = getCurrentWeekRange()

    // 지난주 사용자별 총 공부시간 조회
    const weeklyStudies =
        await studyRepository.getWeeklyStudyTimeByUSers(
            startDate,
            endDate,
        )

    // 공부시간 기준 내림차순 그룹 조회
    const groups =
        await groupRepository.getGroupsByTimeDesc()

    const groupOrderMap = new Map(
        groups.map((group, index) => [
            String(group._id),
            index,
        ]),
    )

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

    const groupMap = new Map(
        groups.map((group) => [
            String(group._id),
            group,
        ]),
    )

    for (const user of users) {
        const totalStudyTime =
            studyTimeMap.get(
                String(user._id),
            ) ?? 0

        const matchedGroup =
            groups.find(
                (group) =>
                    totalStudyTime >=
                    Number(group.groupTime),
            )

        if (!matchedGroup) {
            continue
        }

        const previousGroupId =
            String(user.groupId ?? "")

        const previousGroup =
            groupMap.get(previousGroupId)

        const status =
            getGroupNoticeStatus({
                previousGroup,
                currentGroup:
                    matchedGroup,
                previousGroupId,
                dormantGroupId:
                    config.group.dormantId,
            })

        updates.push({
            userId: user._id,
            groupId:
                String(matchedGroup._id),

            weeklyGroupNotice: {
                weekStart:
                    noticeWeekStart,

                previousGroupId,
                previousGroupName:
                    previousGroup
                        ?.groupName ?? "",

                currentGroupId:
                    String(
                        matchedGroup._id,
                    ),

                currentGroupName:
                    matchedGroup.groupName,

                status,
                isRead: false,
                assignedAt: new Date(),
            },
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