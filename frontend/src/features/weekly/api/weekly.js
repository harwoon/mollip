import { API_URL } from "../../../config/apiUrl.js"

async function getRequest(path, errorMessage) {
  const token = localStorage.getItem("token")

  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || errorMessage)
  }

  return data
}

// 주간 공부 기록 가져오기
export async function getWeeklyStudyRecords(date) {
  const params = new URLSearchParams({
    type: "weekly",
    date,
  })

  return getRequest(
    `/study/records?${params.toString()}`,
    "주간 공부 시간을 불러오지 못했습니다.",
  )
}

// 주간 과목별 공부 비율 가져오기
export async function getWeeklySubjectRatio(date) {
  const params = new URLSearchParams({
    type: "weekly",
    date,
  })

  return getRequest(
    `/statistics/ratio?${params.toString()}`,
    "주간 과목별 공부 시간을 불러오지 못했습니다.",
  )
}

// 주간 투두 기록 가져오기
export async function getWeeklyTodoRecords(date) {
  const params = new URLSearchParams({
    type: "weekly",
    date,
  })

  return getRequest(
    `/todo/records?${params.toString()}`,
    "주간 목표 기록을 불러오지 못했습니다.",
  )
}

// 개인 및 그룹 연속 공부 달성일 가져오기
export async function getGroupStreak() {
  return getRequest(
    "/statistics/streak",
    "연속 공부 달성일을 불러오지 못했습니다.",
  )
}

// 그룹 평균과 개인 주간 공부 시간 가져오기
export async function getGroupWeeklyStudyTime(date) {
  const params = new URLSearchParams({ date })

  return getRequest(
    `/statistics/week?${params.toString()}`,
    "그룹 주간 공부 시간을 불러오지 못했습니다.",
  )
}

// 주간 Todo 달성률 비교
export async function getWeeklyTodoCompare(date) {
  const params = new URLSearchParams({ date })

  return getRequest(
    `/statistics/todo-week?${params.toString()}`,
    "주간 Todo 달성률을 불러오지 못했습니다."
  )
}