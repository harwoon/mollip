const API_URL = import.meta.env.VITE_LOCAL_API_URL;

// 주간 과목별 공부 시간 가져오기
export async function getWeeklyStudyRecords(date) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/study/records?type=weekly&date=${date}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "주간 공부 시간을 불러오지 못했습니다.");
  }

  return data;
}

// 주간 과목별 공부 비율 가져오기
export async function getWeeklySubjectRatio(date) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/statistics/ratio?type=weekly&date=${date}`,
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
      data.message || "주간 과목별 공부 시간을 불러오지 못했습니다.",
    );
  }

  return data;
}

// 주간 투두 기록 가져오기
export async function getWeeklyTodoRecords(date) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/todo/records?type=weekly&date=${date}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "주간 목표 기록을 불러오지 못했습니다.");
  }

  return data;
}
