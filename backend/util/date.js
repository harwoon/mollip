// 날짜 객체를 "YYYY-MM-DD" 문자열로 변환
export function formatDate(dateObj) {
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const date = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
}

// 특정 날짜를 기준으로 해당 주차 계산
export function getWeekRange(date) {
    const targetDate = new Date(date)
    
    // 요일
    const day = targetDate.getDay();
    
    // 월요일 기준 차이 계산
    const diffToMonday = day === 0 ? 6 : day - 1

    // 월요일
    const startDateObj = new Date(targetDate)
    startDateObj.setDate(targetDate.getDate() - diffToMonday)

    // 일요일
    const endDateObj = new Date(startDateObj)
    endDateObj.setDate(startDateObj.getDate() + 6)

    return {
        startDate: formatDate(startDateObj),
        endDate: formatDate(endDateObj)
    }
}

// 어제 날짜 구하기
export function getYesterday(dateString) {
    const dateObj = new Date(dateString)
    dateObj.setDate(dateObj.getDate() - 1)
    
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const date = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
}


// 날짜 문자열 로컬시간기준 Date 객체 변환
export function parseDate(dateString) {
    const [year, month, day] = dateString
        .split("-")
        .map(Number)

        return new Date(year, month - 1, day)
}

// 시작일 ~ 종료일 일수 계산 (시작일, 종료일 포함)
export function getInclusiveDayCount(startDate, endDate){
    const start = parseDate(startDate)
    const end = parseDate(endDate)

    // 하루를 밀리초(ms) 단위로 바꿈
    const millisecondsPerDay = 1000 * 60 * 60 * 24

    return(
        Math.floor((end - start) / millisecondsPerDay)+1
    )
}

// 날짜에 원하는 일수 더하기
export function addDays(dateString, days){
    const date = parseDate(dateString)

    date.setDate(
        date.getDate() + days
    )

    return formatDate(date)
}

// 현재 조회 기간과 동일한 길이의 이전 기간 계산
export function getPreviousPeriod(startDate, endDate){
    const periodDays = getInclusiveDayCount(
        startDate, endDate
    )

    // 이전 기간 종료일, 현재 시작일 바로 전 날
    const previousEndDate = addDays(startDate, -1)

    // 기간이 11일이라면 종료일에서 10일 이전
    const previousStartDate = addDays(
        previousEndDate,
        -(periodDays - 1)
    )

    return{
        startDate: previousStartDate,
        endDate: previousEndDate,
    }
}

// 한국 시간 기준 오늘 날짜 구하기
export function getKstToday(date = new Date()) {
    const formatter = new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "Asia/Seoul",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    )

    const parts = formatter.formatToParts(date)

    const values = Object.fromEntries(
        parts.map((part) => [
            part.type,
            part.value
        ])
    )

    return `${values.year}-${values.month}-${values.day}`
}

export function getCurrentWeekRange() {
    const today = getKstToday()

    return getWeekRange(today)
}

// 달의 몇 주차인지 계산하는 함수
export function getWeekOfMonth(dateString) {
    const date = new Date(dateString)
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1)
    
    // 1일의 요일 구하기 (0: 일요일, 1: 월요일 ... 6: 토요일)
    // ISO 기준(월요일 시작)에 맞추기 위해 일요일(0)을 7로 변환
    const firstDay = firstDate.getDay() || 7
    
    // (현재 일자 + 1일의 요일 보정치) / 7 을 올림 처리
    return Math.ceil((date.getDate() + (firstDay - 1)) / 7)
}

// 일간·주간·월간 현재 기간과 이전 기간 계산
export function getStudyPeriodRanges(
    type,
    dateString,
) {
    const datePattern =
        /^\d{4}-\d{2}-\d{2}$/

    if (!datePattern.test(dateString)) {
        throw new Error(
            "date는 YYYY-MM-DD 형식이어야 합니다.",
        )
    }

    const targetDate =
        parseDate(dateString)

    // 2026-02-31처럼 실제로 존재하지 않는 날짜 방지
    if (
        Number.isNaN(targetDate.getTime()) ||
        formatDate(targetDate) !== dateString
    ) {
        throw new Error(
            "올바른 날짜를 입력해주세요.",
        )
    }

    if (type === "daily") {
        return {
            currentRange: {
                startDate: dateString,
                endDate: dateString,
            },
            previousRange: {
                startDate:
                    addDays(dateString, -1),
                endDate:
                    addDays(dateString, -1),
            },
        }
    }

    if (type === "weekly") {
        const currentRange =
            getWeekRange(dateString)

        return {
            currentRange,
            previousRange: {
                startDate:
                    addDays(
                        currentRange.startDate,
                        -7,
                    ),
                endDate:
                    addDays(
                        currentRange.endDate,
                        -7,
                    ),
            },
        }
    }

    if (type === "monthly") {
        const year =
            targetDate.getFullYear()

        const month =
            targetDate.getMonth()

        const currentStart =
            new Date(year, month, 1)

        const currentEnd =
            new Date(year, month + 1, 0)

        const previousStart =
            new Date(year, month - 1, 1)

        const previousEnd =
            new Date(year, month, 0)

        return {
            currentRange: {
                startDate:
                    formatDate(currentStart),
                endDate:
                    formatDate(currentEnd),
            },
            previousRange: {
                startDate:
                    formatDate(previousStart),
                endDate:
                    formatDate(previousEnd),
            },
        }
    }

    throw new Error(
        "type은 daily, weekly, monthly 중 하나여야 합니다.",
    )
}