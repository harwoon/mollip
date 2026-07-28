const API_URL = import.meta.env.VITE_LOCAL_API_URL;

import { getCurrentDate } from "../../../../util/date";

const DAY_NAMES = [
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
  "일",
];

/**
 * Date 객체를 YYYY-MM-DD 형식으로 변환
 */
function formatDate(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 기준 날짜가 포함된 주의 월요일 구하기
 */
function getMonday(dateString) {
  const date = new Date(
    `${dateString}T00:00:00`,
  );

  const currentDay = date.getDay();

  // 일요일이면 6일 전
  // 화요일이면 1일 전
  // 수요일이면 2일 전
  const difference =
    currentDay === 0
      ? -6
      : 1 - currentDay;

  date.setDate(
    date.getDate() + difference,
  );

  return date;
}

/**
 * 주간 공부 기록을 날짜별로 합산하고
 * 월요일부터 일요일까지 7개 데이터 생성
 */
function makeWeeklyChartData(
  studies,
  baseDate,
) {
  const studyTimeByDate = new Map();

  // 같은 날짜의 공부 시간을 모두 합산
  for (const study of studies) {
    const studyDate = study.studyDate;

    const studySeconds =
      Number(study.sumStudyTime) || 0;

    studyTimeByDate.set(
      studyDate,
      (studyTimeByDate.get(studyDate) || 0) +
        studySeconds,
    );
  }

  const monday = getMonday(baseDate);

  // 공부 기록이 없어도 월~일 7개 생성
  return DAY_NAMES.map((day, index) => {
    const currentDate = new Date(monday);

    currentDate.setDate(
      monday.getDate() + index,
    );

    const date = formatDate(currentDate);

    const studySeconds =
      studyTimeByDate.get(date) || 0;

    return {
      date,
      day,
      studySeconds,

      // 초를 시간으로 변환
      studyTime: Number(
        (studySeconds / 3600).toFixed(2),
      ),
    };
  });
}

/**
 * 서버에서 주간 공부 기록 조회
 */
export async function getWeeklyStudyTime(
  subject,
) {
  const token =
    localStorage.getItem("token");

  const date = getCurrentDate();

  const params = new URLSearchParams({
    type: "weekly",
    date,
  });

  // 과목을 전달받았을 때만 쿼리에 추가
  if (subject) {
    params.append("subject", subject);
  }

  const response = await fetch(
    `${API_URL}/study/records?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "주간 공부 기록 조회에 실패했습니다.",
    );
  }

  // 서버가 배열을 반환하지 않아도
  // 월~일을 0시간으로 생성
  const studies = Array.isArray(data)
    ? data
    : [];

  return makeWeeklyChartData(
    studies,
    date,
  );
}