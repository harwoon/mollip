import * as authRepository from "../repository/auth.js"
import * as groupRepository from "../repository/group.js"

import { config } from "../config.mjs"
import { addDays, getKstToday, getWeekRange } from "../util/date.js"

const DORMANT_AFTER_DAYS = 30

export async function assignDormantGroups() {
    // 한국 날짜 기준 오늘
    const today = getKstToday()

    // 오늘로부터 30일 전
    const cutoffDateString = addDays(
        today,
        -DORMANT_AFTER_DAYS,
    )

    /*
     * lastStudyDate가 없는 회원은
     * createdAt을 기준으로 비교합니다.
     *
     * 한국 시간 자정 기준 Date 객체
     */
    const cutoffCreatedAt = new Date(
        `${cutoffDateString}T00:00:00+09:00`,
    )

    const result =
        await authRepository.assignDormantUsers(
            cutoffDateString,
            cutoffCreatedAt,
        )

    return {
        today,
        cutoffDateString,
        matchedCount:
            result.matchedCount || 0,
        modifiedCount:
            result.modifiedCount || 0,
    }
}

export async function reactivateIfDormant(
    userId,
    currentGroupId,
) {
    // 현재 휴면 그룹이 아니면 아무것도 안 함
    if (
        String(currentGroupId) !==
        String(config.group.dormantId)
    ) {
        return null
    }

    // 복귀할 가장 낮은 일반 그룹
    const lowestGroup =
        await groupRepository
            .getLowestRegularGroup()

    if (!lowestGroup) {
        throw new Error(
            "복귀할 일반 그룹이 없습니다.",
        )
    }

    // 휴면 그룹 정보
    const dormantGroup =
        await groupRepository
            .getGroupById(
                config.group.dormantId,
            )

    // 현재 주 월요일
    const today =
        getKstToday()

    const {
        startDate: weekStart,
    } = getWeekRange(today)

    // RETURN 알림 생성
    const weeklyGroupNotice = {
        status: "RETURN",

        previousGroupId:
            String(
                config.group.dormantId,
            ),

        previousGroupName:
            dormantGroup
                ?.groupName ?? "휴면",

        currentGroupId:
            String(
                lowestGroup._id,
            ),

        currentGroupName:
            lowestGroup.groupName,

        weekStart,

        isRead: false,

        assignedAt:
            new Date(),
    }

    return authRepository
        .reactivateDormantUser(
            userId,
            lowestGroup._id,
            lowestGroup.groupName,
            weekStart,
        )
}