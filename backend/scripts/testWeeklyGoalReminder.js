import mongoose from "mongoose"

import {
    connectDB,
} from "../db/database.js"

import {
    sendWeeklyGoalReminderMails,
} from "../service/weeklyGoalReminderService.js"


try {
    await connectDB()

    const result =
        await sendWeeklyGoalReminderMails({
            // 모든 메일을 본인 테스트 이메일로 전송
            testRecipient:
                "kimlyu9212@gmail.com",

            // 회원 1명의 메일만 생성
            limit: 10,
        })

    console.log(
        "주간 목표 메일 테스트 결과:",
        result,
    )
} catch (error) {
    console.error(
        "주간 목표 메일 테스트 실패:",
        error,
    )
} finally {
    await mongoose.disconnect()
}