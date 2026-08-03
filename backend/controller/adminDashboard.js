import * as adminRepository from "../repository/admin.js"
import * as studyRepository from "../repository/study.js"
import * as statisticsService from "../service/statisticsService.js"
import { getWeekRange, getInclusiveDayCount, getPreviousPeriod, parseDate } from "../util/date.js"

// 전체 사용자 이번주 Todo 달성률
export async function getWeeklyTodoAchievement(req, res) {
    try {
        const achievement = await statisticsService.getWeeklyTodoAchievement()
        return res.status(200).json({
            message: "이번 주 전체 Todo 달성률을 성공적으로 불러왔습니다.",
            achievement
        })

    } catch (error) {
        console.error("이번주 전체 Todo 달성률 조회 실패: ", error)
        return res.status(500).json({ message: "이번주 전체 Todo 달성률을 불러오지 못했습니다." })
    }
}

// 가입 탈퇴 로그 가져오기
export async function getLog(req, res) {
    try {
        const data = await adminRepository.getAllLog()
        return res.status(200).json(data)
    } catch (error) {
        console.error("최근 활동 로그 가져오기 실패:", error)
        return res.status(500).json({ message: "최근 활동 로그 가져오던 중 오류가 발생했습니다." })
    }
}

// 관리자 서비스 전체 학습시간 추이 조회
export async function getStudyTimeTrend(req, res) {
    const {type, startDate, endDate} = req.query

    // 허용하는 조회 단위
    const allowedTypes  = ["daily", "weekly", "monthly"]

    // 날짜 문자열이 YYYY-MM-DD 형식인지 검사
    const datePattern = /^\d{4}-\d{2}-\d{2}$/

    // 하나라도 없으면 요청 실패
    if (!type || !startDate || !endDate) {
        return res.status(400).json({
            message: "type, startDate, endDate를 모두 입력해주세요."
        })
    }

    // 다른 type 들어오면 요청 실패
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({
            message: "type은 daily, weekly, monthly 중 하나여야 합니다."
        })
    }

    // 시작일, 종료일 문자열 형식 검사
    if(
        !datePattern.test(startDate) ||
        !datePattern.test(endDate)
    ) {
        return res.status(400).json({
            message: "날짜는 YYYY-MM-DD 형식으로 입력해주세요."
        })
    }

    // 문자열 날짜 Date 객체 변환
    const startDateObj = parseDate(startDate)
    const endDateObj = parseDate(endDate)

    // 존재하지 않는 날짜까지 검사 (2026-02-30은 정규식으로 통과함, 별도 확인필요)
    const isValidStartDate =
        startDateObj.getFullYear() === Number(startDate.slice(0, 4)) &&
        startDateObj.getMonth() + 1 === Number(startDate.slice(5, 7)) &&
        startDateObj.getDate() === Number(startDate.slice(8, 10))

    const isValidEndDate =
        endDateObj.getFullYear() === Number(endDate.slice(0, 4)) &&
        endDateObj.getMonth() + 1 === Number(endDate.slice(5, 7)) &&
        endDateObj.getDate() === Number(endDate.slice(8, 10))

    // 존재하지 않는 날짜면 요청 실패
    if (!isValidStartDate || !isValidEndDate) {
        return res.status(400).json({
            message: "실제로 존재하는 날짜를 입력해주세요."
        })
    }

    // 시작일이 종료일보다 뒤인 경우 요청 실패
    if (startDateObj > endDateObj) {
        return res.status(400).json({
            message: "startDate는 endDate보다 늦을 수 없습니다."
        })
    }

    // 시작일과 종료일 모두 포함한 조회 기간 계산 (07-01 ~ 07-14는 14일)
    const periodDays = getInclusiveDayCount(
        startDate,
        endDate
    )

    // 일간 데이터는 최대 14일까지 조회 가능
    if (type === "daily" && periodDays > 14) {
        return res.status(400).json({
            message: "일간 조회는 최대 14일까지 가능합니다."
        })
    }

    // 주간 데이터는 최대 3개월까지 조회 가능
    if (type === "weekly") {
        // 시작일 객체를 복사 원본 날짜가 변경되지 않도록 처리
        const weeklyLimitDate = new Date(startDateObj)

        // 조회 시작일을 기준으로 3개월 뒤 날짜 계산
        weeklyLimitDate.setMonth(
            weeklyLimitDate.getMonth() + 3
        )

        // 종료일이 허용 날짜보다 뒤라면 조회 제한 초과
        if (endDateObj > weeklyLimitDate) {
            return res.status(400).json({
                message: "주간 조회는 최대 3개월까지 가능합니다."
            })
        }
    }

    try {

        // 현재 선택 기간과 동일한 일수의 이전 기간 계산
        const previousPeriod = getPreviousPeriod(startDate, endDate)

        // DB에서는 실제 공부 기록이 존재하는 구간만 조회됨
        //
        // 예:
        // 조회 기간이 07-16 ~ 07-22이고
        // 07-20에만 공부했다면 07-20 데이터만 반환
        const rawTrend =
            await studyRepository.getServiceStudyTimeTrend(
                type,
                startDate,
                endDate
            )

        // 기록이 없는 일·주·월을 totalMinutes: 0으로 채움
        const trend = fillMissingTrendData(
            type,
            startDate,
            endDate,
            rawTrend
        )

        // 현재 선택 기간의 서비스 전체 공부시간 합계
        const currentTotalMinutes =
            await studyRepository.getServiceStudyTimeTotal(
                startDate,
                endDate
            )

        // 이전 동일 기간의 서비스 전체 공부시간 합계
        const previousTotalMinutes =
            await studyRepository.getServiceStudyTimeTotal(
                previousPeriod.startDate,
                previousPeriod.endDate
            )

        // 현재 기간에서 이전 기간을 뺀 증감 공부시간
        const differenceMinutes = currentTotalMinutes - previousTotalMinutes

        // 이전 기간 합계가 0이면 나눗셈이 불가능하므로 null 반환
        const changeRate =
            previousTotalMinutes === 0 ? null : Number(
                (differenceMinutes / previousTotalMinutes * 100).toFixed(2)
            )


        return res.status(200).json({
            message: "서비스 학습시간 추이를 성공적으로 조회했습니다.",
            type,
            trend,
            currentPeriod: {
                startDate,
                endDate,
                totalMinutes: currentTotalMinutes
            },
            previousPeriod: {
                startDate: previousPeriod.startDate,
                endDate: previousPeriod.endDate,
                totalMinutes: previousTotalMinutes
            },
            comparison: {
                differenceMinutes,
                changeRate
            }
        })

    } catch (error) {
        console.error("서비스 학습시간 추이 조회 실패:", error)
        return res.status(500).json({
            message: "서비스 학습시간 추이 조회 중 오류가 발생했습니다."
        })
    }
}



// --- 아래는 getStudyTimeTrend 전용 내부 헬퍼 함수들 ---

// Date 객체 YYYY-MM-DD 문자열로 변환
// toISOString()을 사용하면 한국 시간과 UTC 차이 때문에 날짜가 하루 전으로 변할 수 있으므로 직접 문자열을 조합
function formatLocalDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

// YYYY-MM-DD 문자열을 로컬 Date 객체로 변환
function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(
        year,
        month - 1,
        day
    )
}

// 전달받은 날짜가 속한 주의 월요일 계산
function getMonday(date) {
    const result = new Date(date)
    const day = result.getDay()
    const differenceFromMonday = day === 0 ? 6 : day - 1

    result.setDate(
        result.getDate() - differenceFromMonday
    )
    return result
}

// 조회 단위에 맞춰 누락된 구간을 0분으로 채움
function fillMissingTrendData(type, startDate, endDate, rawTrend) {
    // "2026-07-20" → 7200
    const trendMap = new Map(
        rawTrend.map(item => [
            item.date,
            Number(item.totalMinutes) || 0
        ])
    )
    const filledTrend = []

    // 일간 조회 (기록이 없는 날짜는 totalMinutes: 0으로 추가)
    if (type === "daily") {
        const currentDate = parseLocalDate(startDate)
        const lastDate = parseLocalDate(endDate)

        while (currentDate <= lastDate) {
            const date = formatLocalDate(currentDate)
            filledTrend.push({
                date,
                totalMinutes: trendMap.get(date) || 0
            })

            currentDate.setDate(
                currentDate.getDate() + 1
            )
        }
        return filledTrend
    }

    // 주간 조회 : 시작일이 속한 주의 월요일부터 한 주씩 증가
    if (type === "weekly") {
        const currentMonday = getMonday(parseLocalDate(startDate))
        const endDateObject = parseLocalDate(endDate)

        while (currentMonday <= endDateObject) {
            const date = formatLocalDate(currentMonday)

            filledTrend.push({
                // 해당 주 월요일
                date,

                // 공부 기록이 없는 주는 0분
                totalMinutes: trendMap.get(date) || 0
            })
            currentMonday.setDate(
                currentMonday.getDate() + 7
            )
        }

        return filledTrend
    }

    // 월간 조회 : 시작 월부터 종료 월까지 한 달씩 증가
    if (type === "monthly") {
        const startDateObject = parseLocalDate(startDate)
        const endDateObject = parseLocalDate(endDate)

        const currentMonth = new Date(
            startDateObject.getFullYear(),
            startDateObject.getMonth(),
            1
        )

        const lastMonth = new Date(
            endDateObject.getFullYear(),
            endDateObject.getMonth(),
            1
        )

        while (currentMonth <= lastMonth) {
            const year = currentMonth.getFullYear()

            const month = String(
                currentMonth.getMonth() + 1
            ).padStart(2, "0")

            const date = `${year}-${month}`

            filledTrend.push({
                date,
                totalMinutes: trendMap.get(date) || 0
            })

            currentMonth.setMonth(
                currentMonth.getMonth() + 1
            )
        }

        return filledTrend
    }

    // 이미 type 검증을 하고 있지만 예외 상황에서는 원본 데이터 반환
    return rawTrend
}

// 회원현황: summary 이번주 평균 학습시간
export async function getWeeklyAverageStudyTime(req, res) {
    try{
        // 오늘날짜 기준 이번주 월요일, 일요일 계산
        const {startDate, endDate} = getWeekRange(new Date())

        // 이번주 학습기록 있는 회원별 주간 공부시간 조회
        const weeklyStudyTimes = await studyRepository.getWeeklyStudyTimeByUSers(startDate, endDate)

        // 이번주 실제 공부한 회원수
        const studyUserCount = weeklyStudyTimes.length

        // 회원별 공부시간 더해서 이번주 전체 공부시간 계산
        const totalWeeklyStudyTime = weeklyStudyTimes.reduce(
            (sum, user) => {
                return sum + (user.totalStudyTime || 0)
            },
            0
        )

        // 이번주 평균 공부시간 = 이번주 전체 공부시간 / 이번주 공부한 회원수
        // 공부한 회원 없으면 평균 0 반환
        const averageWeeklyStudyTime = studyUserCount === 0 ? 0 : Number(
            (totalWeeklyStudyTime / studyUserCount).toFixed(1)
        )

        return res.status(200).json({
            message: "이번 주 회원 평균 공부시간을 성공적으로 불러왔습니다.",
            startDate,
            endDate,
            studyUserCount,  // 이번 주에 실제 공부한 회원 수
            totalWeeklyStudyTime,  // 이번 주 전체 회원 공부시간 합계 (분)
            averageWeeklyStudyTime  // 이번 주 공부한 회원 기준 평균 공부시간 (분)
        })

    }catch(error){
        console.error("전체 회원 주간 평균 공부시간 조회 실패: ", error)
        return res.status(500).json({
            message: "전체 회원의 이번주 평균 공부시간을 불러오지 못했습니다."
        })
    }
}

// 관리자 홈 전체 회원의 이번 주 총 공부시간 조회
export async function getWeeklyTotalStudyTime(req, res) {
    try {
        // 오늘 날짜를 기준 이번주 계산
        const { startDate, endDate } = getWeekRange(new Date())

        // 관리자, 탈퇴회원 제외한 주간 총 공부시간
        const summary = await studyRepository.getWeeklyStudyTimeSummary(startDate, endDate)

        return res.status(200).json({
            message: "전체 회원의 이번 주 총 공부시간을 성공적으로 불러왔습니다.",
            startDate,
            endDate,
            // 정상 회원 + 휴면 회원 이번주 총 공부시간
            currentWeeklyStudyTime: summary.currentWeeklyStudyTime,
            // 탈퇴한 회원 이번주 총 공부시간
            withdrawnWeeklyStudyTime: summary.withdrawnWeeklyStudyTime,
            // 현재회원, 탈토회원 포함한 이번주 총 공부시간
            totalWeeklyStudyTime: summary.totalWeeklyStudyTime
        })
    } catch (error) {
        console.error("전체 회원 주간 총 공부시간 조회 실패:", error)
        return res.status(500).json({
            message: "전체 회원의 이번 주 총 공부시간을 불러오지 못했습니다."
        })
    }
}
