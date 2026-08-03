# KDT_세미프로젝트_Mollip (몰입)
과목별 학습 시간을 기록하고, 스터디 그룹에 소속되어 서로의 학습 현황을 확인하며 함께 몰입할 수 있는 웹 기반 학습 관리 서비스입니다.

🕒 개발기간: 2026.07.16. ~ 개발중

---

## 1. 프로젝트 실행

### 사전 준비
- Node.js 다운로드
- MongoDB 
- Redis 다운로드

1. backend, frontend, ai 폴더 각각 환경 변수 설정
```
# backend/.env

# JWT 토큰 생성 시 사용할 비밀키
JWT_SECRET=###

# JWT 토큰의 유효시간(초 단위) > 하루
JWT_EXPIRES_SEC=###   

# bcrypt 비밀번호 암호화 시 사용할 Salt Round 값
BCRYPT_SALT_ROUNDS=###

# 서버가 실행될 포트 번호
HOST_PORT=###

# mongoDB string값
DB_HOST=###

# 휴면 그룹 아이디
DORMANT_GROUP_ID=###

# 구글 OAuth
GOOGLE_CLIENT_ID=###
```

```
# frontend/.env
VITE_LOCAL_API_URL=http://127.0.0.1:3000
```

```
# ai/.env
OPENAI_API_KEY=###
```

2. backend 실행
```
cd backend
npm install
npm run dev
```

3. frontend 실행
```
cd backend
npm install
npm run dev
```

4. ai 실행
```
cd ai
pip install fastapi uvicorn openai pydantic python-dotenv
uvicorn main:app --reload
---

## 2. 주요 기능

### 일반 사용자
- 회원가입/로그인 — JWT 기반 인증
- 학습 타이머 — 과목별 학습 시간 기록, 실시간 시작/종료 상태를 소켓으로 그룹원과 공유
- 투두리스트 — 일별 목표 추가/완료 체크, 목표 달성률 계산
- 과목 관리 — 과목별 색상 지정 및 관리
- 학습 기록 조회 — 일간/주간/월간 단위 총 공부시간, 과목별 공부시간, 히트맵 캘린더
- 스터디 그룹 — 주간 총 공부시간 기준 그룹 자동 배정, 내 그룹 순위·상/하위 그룹 정보 확인
- 주간 현황 — 개인/그룹 목표 달성률, 그룹 내 스트릭·공부시간 비교 차트
- 마이페이지 — 프로필 및 회원정보 수정

### 관리자
- 회원 관리 — 전체 회원 목록 조회, 닉네임/소속 그룹 검색, 다항목 정렬, 실시간 학습 상태(공부중/휴식중) 표시, 엑셀 다운로드
- 그룹 관리 — 그룹 생성/수정(그룹명, 색상, 조건 시간, 주간 목표 4종), 그룹별 통계(인원·평균 목표 달성률·평균 공부시간·평균 접속일) 조회, 엑셀 다운로드
- 관리자 홈 대시보드 — 전체 사용자/그룹 현황 요약, 그룹별 통계, 최근 가입·탈퇴 활동 로그
- 자동 그룹 배정 — 매주 월요일 전체 유저의 주간 공부시간을 기준으로 그룹 자동 재배정 (스케줄러)

---

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

---

## 4. 라이브러리


---

## 5. 팀명 및 팀원

### TEAM_DACACHI

| 길준영 | 김동권 | 배성욱 | 오승아 | 이서진(팀장) | 한혜원 |
| --- | --- | --- | --- | --- | --- |
| [@Junyoung](https://github.com/wnsdud2953) | [@Donggwon](https://github.com/dkkim9212) | [@SungUk](https://github.com/BaeSungUk) | [@Seongah](https://github.com/sdesign416) | [@Seojin](https://github.com/leeseojin-dev) | [@Harwoon](https://github.com/harwoon) |