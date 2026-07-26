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