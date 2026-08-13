import cron from "node-cron"
import {assignDormantGroups} from "../service/dormantGroupService.js"

export function startDormantGroupJob() {
    cron.schedule(
        // 매일 자정
        "5 0 * * *",

        async () => {
            try {
                console.log(
                    "[휴면 그룹 배정] 시작",
                )

                const result =
                    await assignDormantGroups()

                console.log(
                    "[휴면 그룹 배정] 완료",
                    {
                        today:
                            result.today,

                        cutoffDate:
                            result.cutoffDateString,

                        matchedCount:
                            result.matchedCount,

                        modifiedCount:
                            result.modifiedCount,
                    },
                )
            } catch (error) {
                console.error(
                    "[휴면 그룹 배정] 실패",
                    error,
                )
            }
        },

        {
            timezone: "Asia/Seoul",
            noOverlap: true,
        },
    )
}