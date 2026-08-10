import cron from "node-cron"
import { assignWeeklyGroups } from "../service/weeklyGroupService.js"

export function startWeeklyGroupJob() {
    cron.schedule(
        "0 0 * * 1",
        async () => {
            try {
                console.log("[주간 그룹 배정] 시작")

                const result =
                    await assignWeeklyGroups()

                console.log(
                    "[주간 그룹 배정] 완료",
                    {
                        startDate:
                            result.startDate,

                        endDate:
                            result.endDate,

                        totalUserCount:
                            result.totalUserCount,

                        updateUserCount:
                            result.updateUserCount,
                    },
                )
            } catch (error) {
                console.error(
                    "[주간 그룹 배정] 실패",
                    error
                )
            }
        },
        {
            timezone: "Asia/Seoul",
        }
    )
}