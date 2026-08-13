import User from "../models/User.js"
import Subject from "../models/Subject.js"
import Study from "../models/Study.js"
import Todo from "../models/Todo.js"
import AiReport from "../models/AiReport.js"
import { getKstToday } from "../util/date.js"
import { config } from "../config.mjs"

// 리포트 생성에 필요한 최소 누적 학습 시간 (3시간)
const REQUIRED_SEGMENT_SECONDS = 3 * 60 * 60

// 오늘 리포트 생성 조건(직전 리포트 이후 누적 공부시간)을 계산
async function getReportEligibility(userId) {
    const todayStr = getKstToday()

    // 오늘 생성된 모든 리포트 (오래된 순 = 뒤로가기/앞으로가기 탐색 순서)
    const todayReports = await AiReport.find({
        user: userId,
        reportDate: todayStr
    }).sort({ createdAt: 1 })

    const lastReport = todayReports.length > 0
        ? todayReports[todayReports.length - 1]
        : null

    // 이번 구간의 시작 시점: 오늘 마지막 리포트 생성 시각 (없으면 오늘 자정)
    const segmentStartAt = lastReport
        ? lastReport.createdAt
        : new Date(`${todayStr}T00:00:00+09:00`)

    // 구간 시작 시점 이후에 쌓인 오늘의 공부 기록
    const segmentStudies = await Study.find({
        user: userId,
        studyDate: todayStr,
        createdAt: { $gt: segmentStartAt }
    }).sort({ createdAt: 1 })

    const segmentStudySeconds = segmentStudies.reduce(
        (sum, record) => sum + (record.sumStudyTime || 0),
        0
    )

    return {
        todayStr,
        todayReports,
        lastReport,
        segmentStudies,
        segmentStudySeconds,
        ready: segmentStudySeconds >= REQUIRED_SEGMENT_SECONDS,
        remainingSeconds: Math.max(0, REQUIRED_SEGMENT_SECONDS - segmentStudySeconds)
    }
}

// 아직 조건을 채우지 못했을 때 보여줄 안내 메시지
function buildNotReadyMessage(lastReport, remainingSeconds) {
    const remainingMinutes = Math.max(1, Math.ceil(remainingSeconds / 60))

    return lastReport
        ? `다음 리포트까지 공부 시간이 ${remainingMinutes}분 더 필요합니다.`
        : `오늘의 리포트를 받으려면 공부 시간이 ${remainingMinutes}분 더 필요합니다.`
}

// 프론트에 넘길 형태로 리포트 목록 가공 (뒤로가기/앞으로가기 탐색용)
function serializeReports(reports) {
    return reports.map(report => ({
        reportData: report.reportData,
        createdAt: report.createdAt,
        segmentStudySeconds: report.segmentStudySeconds
    }))
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// 리포트 상태 조회 (생성하지 않고 현재 상태만 확인)
// date 쿼리로 지난 날짜를 지정하면 해당 날짜에 생성된 리포트 목록만 조회한다
// (리포트 생성은 오늘 날짜에서만 가능하므로 지난 날짜는 ready가 항상 false)
export async function getAiReportStatus(req, res) {
    const userId = req.user._id

    try {
        const todayStr = getKstToday()

        const requestedDate =
            typeof req.query.date === "string" && DATE_PATTERN.test(req.query.date)
                ? req.query.date
                : todayStr

        // 미래 날짜는 오늘로 보정
        const dateStr = requestedDate > todayStr ? todayStr : requestedDate

        if (dateStr === todayStr) {
            const { todayReports, lastReport, ready, remainingSeconds } = await getReportEligibility(userId)

            return res.status(200).json({
                message: ready
                    ? "새 리포트를 생성할 수 있습니다."
                    : buildNotReadyMessage(lastReport, remainingSeconds),
                reports: serializeReports(todayReports),
                ready,
                date: todayStr,
                isToday: true
            })
        }

        // 지난 날짜: 저장된 리포트만 조회 (생성 조건 계산 불필요)
        const pastReports = await AiReport.find({
            user: userId,
            reportDate: dateStr
        }).sort({ createdAt: 1 })

        return res.status(200).json({
            message: "",
            reports: serializeReports(pastReports),
            ready: false,
            date: dateStr,
            isToday: false
        })

    } catch (error) {
        console.error("AI 리포트 상태 조회 중 에러:", error)
        return res.status(500).json({ message: "AI 리포트 상태를 불러올 수 없습니다." })
    }
}

// "새 리포트 생성하기" 버튼 클릭 시 호출: 직전 리포트 이후 3시간이 쌓였는지 확인하고 생성
export async function generateAiReport(req, res) {
    const userId = req.user._id

    try {
        const {
            todayStr,
            todayReports,
            lastReport,
            segmentStudies,
            segmentStudySeconds,
            ready,
            remainingSeconds
        } = await getReportEligibility(userId)

        // 아직 3시간이 쌓이지 않았으면 생성하지 않고 안내 메시지만 반환
        if (!ready) {
            return res.status(200).json({
                message: buildNotReadyMessage(lastReport, remainingSeconds),
                reports: serializeReports(todayReports),
                ready: false
            })
        }

        // 오늘 하루 전체 공부 기록 (누적 총 공부시간 계산용)
        const todayStudies = await Study.find({ user: userId, studyDate: todayStr })
        const todayTotalSeconds = todayStudies.reduce(
            (sum, record) => sum + (record.sumStudyTime || 0),
            0
        )

        const [userInfo, activeSubjects, todayTodos] = await Promise.all([
            User.findById(userId),
            Subject.find({ user: userId, useYn: "Y" }),
            Todo.find({ user: userId, todoDate: todayStr })
        ])

        const topSubjects = activeSubjects.map(sub => sub.subjectName)

        // 오늘 Todo 달성률 및 미달성 항목 계산
        let totalTodos = 0
        let completedTodos = 0
        const missedTodos = []

        todayTodos.forEach(dailyDoc => {
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

        // 이번 구간의 공부 세션 목록 (AI에게 전달할 형태로 변환)
        const segmentSessions = segmentStudies.map(record => {
            const sessionHours = Number(((record.sumStudyTime || 0) / 3600).toFixed(2))

            let kstStartTime = "시간 모름"
            if (record.createdAt) {
                kstStartTime = new Date(record.createdAt).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                })
            }

            return {
                subjectName: record.studyTitle,
                startTime: kstStartTime,
                hours: sessionHours
            }
        })

        const segmentStudyHours = Number((segmentStudySeconds / 3600).toFixed(2))
        const todayTotalHours = Number((todayTotalSeconds / 3600).toFixed(2))

        // FastAPI로 보낼 최종 통계 데이터 조립
        const userStats = {
            userName: userInfo.nickname,
            segmentStudyHours,
            segmentSessions,
            todayTotalHours,
            achievementRate,
            topSubjects,
            missedTodos,
            currentStreak: userInfo.currentStreak || 0
        }

        const fastApiResponse = await fetch(`${config.ai.serverUrl}/ai/daily-report`, {
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

        const newReport = await AiReport.create({
            user: userId,
            reportDate: todayStr,
            segmentStudySeconds,
            reportData: fastApiData.report
        })

        return res.status(200).json({
            message: "AI 코칭 리포트 생성 성공",
            reports: serializeReports([...todayReports, newReport]),
            ready: true
        })

    } catch (error) {
        console.error("AI 리포트 생성 중 에러:", error)
        return res.status(500).json({ message: "AI 리포트를 생성할 수 없습니다." })
    }
}
