export function getCurrentDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

// YYYY-MM-DD 형태로 날짜를 변환
export function formatDate (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 오늘 요일 기준 월요일 날짜 구하기
export function getMonday (date) {
  const targetDate = new Date(date)
  const day = targetDate.getDay()

  const diffToMonday = day === 0 ? 6 : day - 1

  // 월요일
  const startDateObj = new Date(targetDate)
  startDateObj.setDate(targetDate.getDate() - diffToMonday)
  
  return startDateObj
}