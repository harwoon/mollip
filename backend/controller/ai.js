import User from "../models/User.js"
import Subject from "../models/Subject.js"
import Study from "../models/Study.js"
import Todo from "../models/Todo.js"
import { formatDate } from "../util/date.js"

export async function getWeeklyAiReport(req, res) {
    const userId = req.user._id

    try {
        // 유저의 저번주 공부 기록 모으기

        const today = new Date()

        // 저번주 월요일
        const lastWeekStart = new Date(today)
        lastWeekStart.setDate(today.getDate() - today.getDay() - 6) 
        
        // 저번주 일요일
        const lastWeekEnd = new Date(today)
        lastWeekEnd.setDate(today.getDate() - today.getDay())

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

        // - 총 공부 시간 합산 (필드명: sumStudyTime)
        const totalStudySeconds = weeklyStudies.reduce((sum, record) => sum + (record.sumStudyTime || 0), 0)
        const totalStudyHours = Math.floor(totalStudySeconds / 3600)

        // - 투두리스트 달성률 및 실패한 항목 계산
        let totalTodos = 0
        let completedTodos = 0
        const missedTodos = [] // AI 맞춤 추천(Todo)을 위해 넘겨줄 실패 항목들

        // Todo 문서(하루 단위)들을 순회
        weeklyTodos.forEach(dailyDoc => {
            if (dailyDoc.todo && Array.isArray(dailyDoc.todo)) {
                // 하루치 배열 안의 낱개 Todo들을 순회
                dailyDoc.todo.forEach(item => {
                    totalTodos += 1
                    if (item.state === true) {
                        completedTodos += 1
                    } else {
                        // state가 false면 실패한 투두 리스트에 내용(item.todo) 추가
                        missedTodos.push(item.todo) 
                    }
                })
            }
        })

        const achievementRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

        // 4. FastAPI로 보낼 최종 통계 데이터 조립
        const userStats = {
            userName: userInfo.nickname,
            totalStudyHours: totalStudyHours,
            achievementRate: achievementRate,
            topSubjects: topSubjects,
            missedTodos: missedTodos
        }


        // fastAPI 포트는 8000
        const fastApiResponse = await fetch("http://127.0.0.1:8000/ai/weekly-report", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userStats) // DB에서 모은 데이터를 JSON으로 변환해서 쏨
        })

        if (!fastApiResponse.ok) {
            throw new Error("FastAPI 통신 실패")
        }

        // 4. 프론트엔드(React)로 최종 완성된 AI 리포트를 응답으로 보내줍니다!
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