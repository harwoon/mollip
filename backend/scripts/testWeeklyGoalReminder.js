import mongoose from "mongoose"

import {
    connectDB,
} from "../db/database.js"

import {
    verifyMailer,
} from "../util/mailer.js"

import {
    sendWeeklyGoalReminderMails,
} from "../service/weeklyGoalReminderService.js"

try {
    // 1. MongoDB 연결 확인
    await connectDB()
    console.log("✅ DB 연결 성공")

    // 2. SMTP 설정과 로그인 확인
    await verifyMailer()
    console.log("✅ SMTP 연결 및 인증 성공")

    // 3. 실제 회원 한 명에게만 발송
    const result =
        await sendWeeklyGoalReminderMails({
            limit: 40,
        })

    console.dir(result, {
        depth: null,
    })

    if (result.failureCount > 0) {
        console.error(
            "❌ 메일 발송 실패:",
            result.failures,
        )
    } else {
        console.log(
            "✅ 메일 발송 성공:",
            result.successes,
        )
    }
} catch (error) {
    console.error("❌ 테스트 실패")
    console.error("message:", error.message)
    console.error("code:", error.code)
    console.error("response:", error.response)
    console.error("stack:", error.stack)
} finally {
    await mongoose.disconnect()
}