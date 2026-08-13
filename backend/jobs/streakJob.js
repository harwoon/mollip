import cron from "node-cron"
import * as streakService from "../service/streakService.js"

export function startStreakJob() {
    cron.schedule(
        "10 0 * * *",//test 후 0 0 * * *로 수정
        async () => {
            try {
                const result =
                    await streakService.resetExpiredStreaks()

                console.log(
                    "연속 공부일 초기화 완료:",
                    result.modifiedCount
                )
            } catch (error) {
                console.error(
                    "연속 공부일 초기화 실패:",
                    error
                )
            }
        },
        {
            timezone: "Asia/Seoul",
            noOverlap: true,
        }
    )
}