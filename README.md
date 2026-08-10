# KDT_세미프로젝트_Mollip (몰입)
과목별 공부 시간을 기록하고, 스터디 그룹에 소속되어 서로의 공부 현황을 확인하며 함께 몰입할 수 있는 웹 기반 공부 관리 서비스입니다.

🕒 개발기간: 2026.07.16. ~ 개발중



## 1. 프로젝트 실행

### 사전 준비
- Node.js 다운로드
- MongoDB 
- Redis 다운로드

### **1. backend 실행**
```
cd backend
npm install
npm run dev
```

### **2. frontend 실행**
```
cd backend
npm install
npm run dev
```

### **3. ai 실행**
```
cd ai
pip install fastapi uvicorn openai pydantic python-dotenv
uvicorn main:app --reload
```
> AI 리포트 기능은 메인 백엔드가 내부적으로 FastAPI 서버(8000번 포트)를 호출하는 구조입니다. AI 리포트 기능을 테스트하려면 이 서버도 함께 실행해야 합니다.



## 2. 주요 기능

### 일반 사용자
- 회원가입/로그인 — JWT 기반 인증
- 학습 타이머 — 과목별 공부 시간 기록, 실시간 시작/종료 상태를 소켓으로 그룹원과 공유
- 투두리스트 — 일별 목표 추가/완료 체크, 목표 달성률 계산
- 과목 관리 — 과목별 색상 지정 및 관리
- 공부 기록 조회 — 일간/주간/월간 단위 총 공부시간, 과목별 공부시간, 히트맵 캘린더
- 스터디 그룹 — 주간 총 공부시간 기준 그룹 자동 배정, 내 그룹 순위·상/하위 그룹 정보 확인
- 주간 현황 — 개인/그룹 목표 달성률, 그룹 내 스트릭·공부시간 비교 차트
- 마이페이지 — 프로필 및 회원정보 수정

### 관리자
- 회원 관리 — 전체 회원 목록 조회, 닉네임/소속 그룹 검색, 다항목 정렬, 실시간 공부 상태(공부중/휴식중) 표시, 엑셀 다운로드
- 그룹 관리 — 그룹 생성/수정(그룹명, 색상, 조건 시간, 주간 목표 4종), 그룹별 통계(인원·평균 목표 달성률·평균 공부시간·평균 접속일) 조회
- 관리자 홈 대시보드 — 전체 사용자/그룹 현황 요약, 그룹별 통계, 최근 가입·탈퇴 활동 로그
- 자동 그룹 배정 — 매주 월요일 전체 유저의 주간 공부시간을 기준으로 그룹 자동 재배정 (스케줄러)



## 3. 기술 스택

### Backend
![NodeJS](https://img.shields.io/badge/node.js-6DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

### Frontend
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)



## 4. 환경 변수 설정

### backend 환경변수

| 변수명 | 설명 |
|---|---|
| `DB_HOST` | MongoDB 접속 주소 |
| `JWT_SECRET` | JWT 서명용 비밀 키 |
| `JWT_EXPIRES_SEC` | JWT 만료 시간(초) |
| `BCRYPT_SALT_ROUNDS` | 비밀번호 해시 salt 라운드 |
| `HOST_PORT` | 서버 포트 |
| `DORMANT_GROUP_ID` | 휴면 그룹 ID |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `CORS_ORIGINS` | 허용할 프론트 origin (콤마 구분) |
|---|---|
| `MAIL_HOST` |	SMTP 서버 주소 (예: smtp.gmail.com) 
| `MAIL_PORT` |	SMTP 포트 (보통 587 또는 465) |
| `MAIL_SECURE` | true면 SSL 사용(465번 포트용), false면 TLS(587번 포트용) |
| `MAIL_USER` | 메일 발송용 계정 (예: Gmail 주소) | 
| `MAIL_PASSWORD` | 메일 계정 비밀번호 또는 앱 비밀번호(Gmail은 일반 비번 대신 "앱 비밀번호" 필요) |
| `MAIL_FROM_NAME` | 수신자에게 보이는 발신자 이름 |
| `MAIL_FROM_ADDRESS` |	실제 발신 이메일 주소 |
| `FRONTEND_URL` | 메일 본문에 넣을 링크의 기준 주소 (기본 http://localhost:5173) |

### frontend 환경변수

파일이 2개입니다. `.env`는 항상 로드되고, `.env.tunnel`은 `npm run dev:tunnel`(devtunnels로 시연할 때)로 실행할 때만 추가로 로드되어 `.env`의 `VITE_REMOTE_API_URL` 값을 덮어씁니다.

**`.env`** (기본, 항상 로드)

| 변수명 | 설명 |
|---|---|
| `VITE_LOCAL_API_URL` | 백엔드 API 서버 주소 (로컬 개발용) |
| `VITE_REMOTE_API_URL` | 백엔드 API 서버 주소 (원격 접속용 devtunnels 등). **비워둠** `.env.tunnel`로 덮어씀 |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID (프론트엔드용. 백엔드 `GOOGLE_CLIENT_ID`와 동일 값 사용) |

**`.env.tunnel`** (`npm run dev:tunnel` 실행 시에만 추가 로드, `VITE_REMOTE_API_URL` 덮어씀)

| 변수명 | 설명 |
|---|---|
| `VITE_REMOTE_API_URL` | 백엔드 서버의 devtunnels 주소 (devtunnels로 시연할 때 사용) |

### AI 환경변수

| 변수명 | 설명 |
|---|---|
| `OPENAI_API_KEY` | OpenAI(GPT) API 호출용 키 — GPT 프롬프트 실행에 사용 |



## 5. 라이브러리



## 6. 팀명 및 팀원

### TEAM_DACACHI

| 길준영 | 김동권 | 배성욱 | 오승아 | 이서진(팀장) | 한혜원 |
| --- | --- | --- | --- | --- | --- |
| [@Junyoung](https://github.com/wnsdud2953) | [@Donggwon](https://github.com/dkkim9212) | [@SungUk](https://github.com/BaeSungUk) | [@Seongah](https://github.com/sdesign416) | [@Seojin](https://github.com/leeseojin-dev) | [@Harwoon](https://github.com/harwoon) |