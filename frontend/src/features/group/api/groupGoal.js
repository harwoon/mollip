const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000";

/*
 * 로그인한 사용자의
 * 그룹 목표와 이번 주 달성 현황 조회
 */
export async function getMyGroupGoals() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/group/goals/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "그룹 목표 조회에 실패했습니다.");
  }

  return data;
}
