import cron from "node-cron"

import {sendWeeklyGoalReminderMails} from "../service/weeklyGoalReminderService.js"


export function startWeeklyGoalReminderJob() {
    return cron.schedule(
        /*
         * 매주 목요일 00:00
         *
         * 분: 0
         * 시: 0
         * 일: 모든 날짜
         * 월: 모든 월
         * 요일: 목요일 4
         */
        "15 0 * * 4",

        async () => {
            const startedAt =
                new Date()

            console.log(
                "[주간 목표 메일] 발송 시작",
                startedAt.toLocaleString(
                    "ko-KR",
                    {
                        timeZone:
                            "Asia/Seoul",
                    },
                ),
            )

            try {
                const result =
                    await sendWeeklyGoalReminderMails()

                console.log(
                    "[주간 목표 메일] 발송 완료",
                    {
                        weekStartDate:
                            result.weekStartDate,

                        weekEndDate:
                            result.weekEndDate,

                        targetCount:
                            result.targetCount,

                        successCount:
                            result.successCount,

                        failureCount:
                            result.failureCount,

                        skippedCount:
                            result.skippedCount,
                    },
                )

                if (
                    result.failures.length >
                    0
                ) {
                    console.error(
                        "[주간 목표 메일] 일부 발송 실패",
                        result.failures,
                    )
                }

                if (
                    result.skippedUsers
                        .length > 0
                ) {
                    console.warn(
                        "[주간 목표 메일] 발송 제외 회원",
                        result.skippedUsers,
                    )
                }
            } catch (error) {
                console.error(
                    "[주간 목표 메일] 작업 실패",
                    error,
                )
            }
        },

        {
            timezone:
                "Asia/Seoul",

            /*
             * 이전 메일 작업이 끝나지 않은 상태에서
             * 다음 작업이 시작되는 것을 방지
             */
            noOverlap: true,

            name:
                "weekly-goal-reminder",
        },
    )
}