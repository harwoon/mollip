// npm run dev로 실행 -> VITE_REMOTE_API_URL이 빈 문자열인 경우(원격주소) -> VITE_LOCAL_API_URL(로컬주소) 사용
// npm run dev:tunnel로 실행 -> VITE_REMOTE_API_URL(원격주소)이 devtunnels 주소로 채워져서 원격주소 사용
export const API_URL = import.meta.env.VITE_REMOTE_API_URL || import.meta.env.VITE_LOCAL_API_URL