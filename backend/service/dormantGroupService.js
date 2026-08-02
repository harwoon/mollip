import * as authRepository from "../repository/auth.js"
import * as groupRepository from "../repository/group.js"

import { config } from "../config.mjs"
import {addDays,getKstToday,} from "../util/date.js"

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
    if (
        String(currentGroupId) !==
        config.group.dormantId
    ) {
        return null
    }

    const lowestGroup =
        await groupRepository
            .getLowestRegularGroup()

    if (!lowestGroup) {
        throw new Error(
            "복귀할 일반 그룹이 없습니다.",
        )
    }

    return authRepository
        .reactivateDormantUser(
            userId,
            lowestGroup._id,
        )
}