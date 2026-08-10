import * as groupRepository from "../repository/group.js"
import * as studyRepository from "../repository/study.js"
import * as authRepository from "../repository/auth.js"

import {getKstToday, getWeekRange} from "../util/date.js"


// 이전 그룹과 새 그룹을 비교해서
// 상승 / 유지 / 하락 판정
function getGroupNoticeStatus(
    previousGroup,
    currentGroup,
) {
    // 기존 그룹 정보를 찾지 못한 예외 상황
    if (!previousGroup) {
        return "SAME"
    }

    const previousGroupTime =
        Number(previousGroup.groupTime)

    const currentGroupTime =
        Number(currentGroup.groupTime)

    // 새 그룹의 조건 시간이 더 높으면 상승
    if (
        currentGroupTime >
        previousGroupTime
    ) {
        return "UP"
    }

    // 새 그룹의 조건 시간이 더 낮으면 하락
    if (
        currentGroupTime <
        previousGroupTime
    ) {
        return "DOWN"
    }

    return "SAME"
}


export async function assignWeeklyGroups() {

    // =========================
    // 1. 지난주 기간 구하기
    // =========================

    const lastWeekDate = new Date()

    lastWeekDate.setDate(
        lastWeekDate.getDate() - 7,
    )

    const {
        startDate,
        endDate,
    } = getWeekRange(
        lastWeekDate,
    )


    // =========================
    // 2. 이번 주 월요일
    // 알림의 weekStart로 사용
    // =========================

    const {
        startDate: noticeWeekStart,
    } = getWeekRange(
        getKstToday(),
    )


    // =========================
    // 3. 지난주 공부시간 조회
    // =========================

    const weeklyStudies =
        await studyRepository
            .getWeeklyStudyTimeByUSers(
                startDate,
                endDate,
            )


    // =========================
    // 4. 그룹 조회
    // 높은 그룹부터 정렬
    // =========================

    const groups =
        await groupRepository
            .getGroupsByTimeDesc()


    // =========================
    // 5. 사용자 조회
    // _id + 현재 groupId
    // =========================

    const users =
        await authRepository
            .getAllUsers()


    if (groups.length === 0) {
        throw new Error(
            "등록된 그룹이 없습니다.",
        )
    }


    // =========================
    // 6. 공부시간 Map
    // =========================

    const studyTimeMap =
        new Map(
            weeklyStudies.map(
                (study) => [
                    String(study._id),

                    Number(
                        study.totalStudyTime,
                    ) || 0,
                ],
            ),
        )


    // =========================
    // 7. 그룹 Map
    //
    // groupId → Group
    //
    // 이전 그룹 이름을 찾기 위해 필요
    // =========================

    const groupMap =
        new Map(
            groups.map(
                (group) => [
                    String(group._id),
                    group,
                ],
            ),
        )


    const updates = []


    // =========================
    // 8. 사용자별 그룹 재배치
    // =========================

    for (const user of users) {

        const totalStudyTime =
            studyTimeMap.get(
                String(user._id),
            ) ?? 0


        // 공부시간 조건을 만족하는
        // 가장 높은 그룹
        const matchedGroup =
            groups.find(
                (group) =>
                    totalStudyTime >=
                    Number(
                        group.groupTime,
                    ),
            )


        if (!matchedGroup) {
            continue
        }


        // =====================
        // 변경 전 그룹
        // =====================

        const previousGroupId =
            String(
                user.groupId ?? "",
            )


        const previousGroup =
            groupMap.get(
                previousGroupId,
            )


        // =====================
        // 변경 후 그룹
        // =====================

        const currentGroup =
            matchedGroup


        // =====================
        // UP / SAME / DOWN
        // =====================

        const status =
            getGroupNoticeStatus(
                previousGroup,
                currentGroup,
            )


        // =====================
        // groupId와 알림을
        // 동시에 Repository로 전달
        // =====================

        updates.push({
            userId:
                user._id,

            groupId:
                String(
                    currentGroup._id,
                ),

            weeklyGroupNotice: {

                weekStart:
                    noticeWeekStart,

                previousGroupId:
                    previousGroupId,

                previousGroupName:
                    previousGroup
                        ?.groupName ??
                    "",

                currentGroupId:
                    String(
                        currentGroup._id,
                    ),

                currentGroupName:
                    currentGroup
                        .groupName,

                status,

                // 새 알림이므로 안 읽음
                isRead: false,

                assignedAt:
                    new Date(),
            },
        })
    }


    // =========================
    // 9. DB 한번에 업데이트
    // =========================

    const result =
        await authRepository
            .updateUserGroups(
                updates,
            )


    return {
        startDate,
        endDate,

        totalUserCount:
            users.length,

        studyUserCount:
            weeklyStudies.length,

        updateUserCount:
            updates.length,

        result,
    }
}