import User from "../models/User.js"
import Subject from "../models/Subject.js"
import Study from "../models/Study.js"
import Todo from "../models/Todo.js"
import { formatDate } from "../util/date.js"

export async function getWeeklyAiReport(req, res) {
    const userId = req.user._id

    try {
        const today = new Date()

        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()

        // 저번주 월요일
        const lastWeekStart = new Date(today)
        lastWeekStart.setDate(today.getDate() - dayOfWeek - 6) 
        
        // 저번주 일요일
        const lastWeekEnd = new Date(today)
        lastWeekEnd.setDate(today.getDate() - dayOfWeek)

        // 문자열 변환 ("2026-07-27" ~ "2026-08-02")
        const startDateStr = formatDate(lastWeekStart)
        const endDateStr = formatDate(lastWeekEnd)

        // DB 데이터 동시 조회 (문자열 형태의 날짜로 쿼리)
        const [userInfo, activeSubjects, weeklyStudies, weeklyTodos] = await Promise.all([
            User.findById(userId),
            Subject.find({ user: userId, useYn: "Y" }),
            Study.find({ user: userId, studyDate: { $gte: startDateStr, $lte: endDateStr } }),
            Todo.find({ user: userId, todoDate: { $gte: startDateStr, $lte: endDateStr } })
        ])

        // - 사용 중인 과목 이름만 추출
        const topSubjects = activeSubjects.map(sub => sub.subjectName)

        // - 투두리스트 달성률 및 실패한 항목 계산
        let totalTodos = 0
        let completedTodos = 0
        const missedTodos = [] 

        weeklyTodos.forEach(dailyDoc => {
            if (dailyDoc.todo && Array.isArray(dailyDoc.todo)) {
                dailyDoc.todo.forEach(item => {
                    totalTodos += 1
                    if (item.state === true) {
                        completedTodos += 1
                    } else {
                        missedTodos.push(item.todo) 
                    }
                })
            }
        })

        const achievementRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

        const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
        const dailyRecordsMap = {}

        // 공백 요일을 파악
        let loopDate = new Date(lastWeekStart)
        while (loopDate <= lastWeekEnd) {
            const dStr = formatDate(loopDate)
            dailyRecordsMap[dStr] = {
                day: dayNames[loopDate.getDay()],
                dailyTotalHours: 0,
                sessions: []
            }
            loopDate.setDate(loopDate.getDate() + 1)
        }

        let totalStudySeconds = 0 // 주간 총 공부시간 계산용

        // 실제 DB에서 가져온 공부 기록을 해당하는 날짜 넣기
        weeklyStudies.forEach(record => {
            const dStr = record.studyDate // 예: "2026-08-01"
            
            if (dailyRecordsMap[dStr]) {
                totalStudySeconds += (record.sumStudyTime || 0)

                const sessionHours = Number(((record.sumStudyTime || 0) / 3600).toFixed(2))

                dailyRecordsMap[dStr].dailyTotalHours += sessionHours
                dailyRecordsMap[dStr].sessions.push({
                    subjectName: record.studyTitle,
                    hours: sessionHours
                })
            }
        })

        Object.values(dailyRecordsMap).forEach(dayRecord => {
            dayRecord.dailyTotalHours = Number(dayRecord.dailyTotalHours.toFixed(2))
        })

        const dailyRecords = Object.values(dailyRecordsMap)
        
        // 주간 총 공부 시간 계산
        const totalStudyHours = Math.floor(totalStudySeconds / 3600)

        // FastAPI로 보낼 최종 통계 데이터 조립
        const userStats = {
            userName: userInfo.nickname,
            totalStudyHours: totalStudyHours,
            achievementRate: achievementRate,
            topSubjects: topSubjects,
            missedTodos: missedTodos,
            dailyRecords: dailyRecords
        }

        // fastAPI 포트는 8000
        const fastApiResponse = await fetch("http://127.0.0.1:8000/ai/weekly-report", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userStats) 
        })

        if (!fastApiResponse.ok) {
            throw new Error("FastAPI 통신 실패")
        }

        const fastApiData = await fastApiResponse.json()

        return res.status(200).json({
            message: "AI 코칭 리포트 생성 성공",
            report: fastApiData.report
        })

    } catch (error) {
        console.error("AI 리포트 생성 중 에러:", error)
        return res.status(500).json({ message: "AI 리포트를 생성할 수 없습니다." })
    }
}