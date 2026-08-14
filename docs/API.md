# Mollip API 명세서

**Base URL**
| 환경 | 주소 | 비고 |
|---|---|---|
| 로컬 개발 (`npm run dev`) | `http://127.0.0.1:3000` | 프론트 `.env`의 `VITE_LOCAL_API_URL` |
| Docker (`docker compose up`) | `http://localhost:3000` | 포트는 로컬과 동일, compose가 내부 네트워크만 재구성 |
| devtunnels 원격 시연 | 프론트 `.env.tunnel`의 `VITE_REMOTE_API_URL` 값 (실행 시마다 달라짐) | `npm run dev:tunnel` 실행 시에만 사용 |

**인증 방식**: JWT 기반 (`isAuth` 미들웨어), 관리자 전용 API는 `isAdmin` 미들웨어 추가 적용
**공통 응답 형식**: JSON

---

## 1. /auth — 인증·회원

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/auth/checkId` | - | 아이디 중복 확인 |
| POST | `/auth/signup` | - | 회원가입 (프로필 이미지 업로드 포함) |
| POST | `/auth/login` | - | 로그인 |
| POST | `/auth/google` | - | 구글 소셜 로그인 |
| POST | `/auth/dormant/verify` | - | 휴면회원 복귀 인증번호 검증 |
| POST | `/auth/dormant/resend` | - | 휴면회원 인증번호 재전송 |
| GET | `/auth/me` | ✅ | 로그인 유지 체크 + 내 정보 조회 |
| POST | `/auth/logout` | ✅ | 로그아웃 |
| PATCH | `/auth/me` | ✅ | 회원 정보 수정 |
| PATCH | `/auth/password` | ✅ | 비밀번호 변경 |
| PATCH | `/auth/profile-image` | ✅ | 프로필 이미지 수정 |
| POST | `/auth/subject` | ✅ | 과목 생성 |
| GET | `/auth/subject` | ✅ | 과목 목록 조회 |
| PUT | `/auth/subject/:id` | ✅ | 과목 수정 |
| DELETE | `/auth/subject/:id` | ✅ | 과목 삭제 |
| PATCH | `/auth/subject/order` | ✅ | 과목 순서 저장 |
| PATCH | `/auth/withdraw` | ✅ | 회원 탈퇴 |
| POST | `/auth/weekly-group-notice/consume` | ✅ | 주간 그룹 변경 알림 확인 처리 |

---

## 2. /study — 학습 기록

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| POST | `/study/addStudy` | ✅ | 공부 기록 추가 (streak 갱신·휴면해제 동시 처리) |
| GET | `/study/records` | ✅ | 일간/주간/월간 기록 조회 (`type`, `date`, `sort`, `limit`) |
| GET | `/study/records/subject` | ✅ | 일간/주간/월간 과목별 기록 조회 (`type`, `subject`, `date`) |

---

## 3. /statistics — 통계

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/statistics/total` | ✅ | 총 공부시간 조회 (`type`, `date`) |
| GET | `/statistics/ratio` | ✅ | 과목별 공부 비율 조회 |
| GET | `/statistics/streak` | ✅ | 그룹 평균 연속학습일 (주간현황용) |
| GET | `/statistics/week` | ✅ | 그룹 vs 개인 주간 일별 공부시간 비교 |
| GET | `/statistics/subject-summary` | ✅ | 과목별 공부시간 + 이전 기간 대비 비교 |
| GET | `/statistics/todo-week` | ✅ | 주간 개인 vs 그룹 Todo 달성률 비교 |

---

## 4. /todo — Todo

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/todo` | ✅ | Todo 목록 조회 |
| GET | `/todo/achievement` | ✅ | 목표 달성률 조회 (`type`, `date`) |
| GET | `/todo/records` | ✅ | 일간/주간/월간 Todo 기록 조회 |
| POST | `/todo` | ✅ | Todo 추가 |
| PATCH | `/todo/:todoId/state` | ✅ | Todo 완료 여부 변경 |
| DELETE | `/todo/:todoId` | ✅ | Todo 삭제 |

---

## 5. /group — 그룹

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/group` | ✅ | 내 그룹 정보 조회 |
| GET | `/group/groups` | ✅ | 전체 그룹 목록 조회 |
| GET | `/group/higher` | ✅ | 상위 그룹 조회 (승급까지 필요 시간 포함) |
| GET | `/group/lower` | ✅ | 하위 그룹 조회 (강등까지 남은 시간 포함) |
| GET | `/group/weekly-ranking` | ✅ | 그룹 내 주간 랭킹 조회 |
| GET | `/group/goals/me` | ✅ | 내 주간 그룹 목표 달성 현황 조회 |

---

## 6. /schedule — 일정

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/schedule` | ✅ | 일정 목록 조회 |
| POST | `/schedule` | ✅ | 일정 추가 |
| PATCH | `/schedule/:scheduleId` | ✅ | 일정 수정 |
| DELETE | `/schedule/:scheduleId` | ✅ | 일정 삭제 |

---

## 7. /ai — AI 학습 리포트

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/ai/report` | ✅ | 오늘 리포트 상태 조회 (생성 가능 여부·기존 리포트 목록) |
| POST | `/ai/report` | ✅ | 새 리포트 생성 (직전 리포트 이후 3시간 누적 시에만 생성) |

---

## 8. /admin — 관리자 전용 (전체 `isAuth` + `isAdmin` 적용)

### 8-1. 홈 대시보드

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/admin/study-time-trend` | 기간별 공부시간 추이 (`type`, `startDate`, `endDate`) |
| GET | `/admin/weekly-average-study-time` | 이번 주 전체 회원 평균 공부시간 |
| GET | `/admin/weekly-total-study-time` | 이번 주 전체/휴면/탈퇴 회원 공부시간 합계 |
| GET | `/admin/todo-achievement/weekly` | 이번 주 전체 Todo 달성률 |
| GET | `/admin/log` | 가입·탈퇴 로그 조회 |

### 8-2. 회원 관리

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/admin/users/count` | 전체 회원 수 (정상+휴면, 탈퇴 제외) |
| GET | `/admin/users/active` | 활성 회원 목록 |
| GET | `/admin/users/export` | 회원 목록 엑셀 내보내기 |
| GET | `/admin/users` | 회원 목록 조회 |
| GET | `/admin/users/:id` | 회원 상세 조회 |
| GET | `/admin/user/totalStudy` | 회원별 기간 총 공부시간 (`type`, `userId`, `start`, `end`) |
| GET | `/admin/user/subjectTrend` | 회원별 과목 공부시간 추이 |
| GET | `/admin/user/studyTrend` | 회원별 공부시간 추이 |
| GET | `/admin/user/totalStudyTime` | 회원별 이번 주 공부시간 |
| GET | `/admin/user/totalStudyRecord` | 회원별 전체 누적 공부시간 |
| GET | `/admin/users/:userId/todo-achievement-trend` | 회원별 Todo 달성률 추이 |

### 8-3. 그룹 관리

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/admin/groups/count` | 전체 그룹 수 |
| GET | `/admin/groups/weekly-study-time` | 그룹별 주간 총 공부시간 |
| GET | `/admin/groups/statistics` | 그룹별 인원·평균 달성률·평균 공부시간·평균 학습일 |
| GET | `/admin/groups/:id/members` | 그룹별 회원 및 개인 목표 달성률 |
| GET | `/admin/group-todo-achievement` | 그룹별 Todo 달성률 (`date`) |
| GET | `/admin/groups` | 그룹 목록 조회 |
| GET | `/admin/groups/:id` | 그룹 색상 조회 |
| POST | `/admin/groups` | 그룹 생성 |
| PATCH | `/admin/groups/:id` | 그룹 수정 |
| POST | `/admin/assign-weekly` | 주간 그룹 자동 배정 수동 실행 |

### 8-4. 관리 회원 현황 (휴면 처리)

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/admin/member-status` | 미학습·휴면 대상 회원 조회 |
| POST | `/admin/member-status/send-all-mail` | 대상 회원 일괄 메일 발송 |

---

## 실시간 통신 (Socket.io, REST 아님)

### Room 구조
- `admin_room`: 관리자 대시보드 전용 공용 룸
- `{groupId}`: 그룹별 룸 (그룹 페이지 접속 시 join, 이탈 시 leave)

### Client → Server

| 이벤트 | payload | 설명 |
|---|---|---|
| `joinAdminRoom` | - | `admin_room` 입장. 입장한 소켓에 `currentAdminActiveUsers` 전달 |
| `leaveAdminRoom` | - | `admin_room` 퇴장 |
| `joinGroup` | `{ groupId }` (ack) | 그룹 룸 입장. 입장한 소켓에 `currentActiveUsers` 전달, ack로 `{ ok, message? }` 응답 |
| `leaveGroup` | `{ groupId }` | 그룹 페이지 이탈 시 룸만 퇴장 (소켓 연결 자체는 유지) |
| `startStudy` | `{ groupId, userId, userName, profileImg, subjectName }` (ack) | 타이머 시작, Redis(`study:{groupId}`)에 저장 후 그룹원·관리자에게 브로드캐스트. 기존 시작 시간이 저장되어 있으면 재사용(새로고침해도 타이머 초기화 안 됨) |
| `stopStudy` | `{ groupId, userId }` (ack) | 타이머 종료, Redis에서 해당 사용자 정보 삭제 후 그룹원·관리자에게 종료 알림 브로드캐스트 |
| `disconnect` | - | 소켓 연결 종료 (새로고침 포함) — Redis 데이터는 삭제하지 않음 |

### Server → Client

| 이벤트 | 대상 | payload | 설명 |
|---|---|---|---|
| `currentAdminActiveUsers` | 입장한 소켓 1명 | `{ groupId, userId, userName, startTime, profileImg, subjectName }[]` | `joinAdminRoom` 시 현재 전체 공부 중인 사용자 목록 전달 |
| `currentActiveUsers` | 입장한 소켓 1명 | Redis raw (`{ [userId]: JSON string }`) | `joinGroup` 시 해당 그룹의 현재 공부 중인 사용자 목록 전달 |
| `userStartedStudy` | 그룹 룸 전체 | `{ userId, userName, startTime, profileImg, subjectName }` | 그룹원 중 한 명이 공부를 시작함 |
| `adminUserStarted` | `admin_room` | `{ groupId, userId, userName, startTime, profileImg, subjectName }` | 임의 그룹에서 공부 시작 발생 (관리자용) |
| `userStoppedStudy` | 그룹 룸 전체 | `{ userId }` | 그룹원 중 한 명이 공부를 종료함 |
| `adminUserStopped` | `admin_room` | `{ userId }` | 임의 그룹에서 공부 종료 발생 (관리자용) |

---

## 참고

- `isAuth`: 로그인 여부를 확인하는 인증 미들웨어 (JWT 검증)
- `isAdmin`: 관리자 권한(`role: "admin"`)을 확인하는 인가 미들웨어, `/admin` 라우터 전체에 일괄 적용
- 총 8개 라우터(`auth`, `study`, `statistics`, `todo`, `group`, `schedule`, `ai`, `admin`), 약 73개 REST 엔드포인트 + 13개 소켓 이벤트(client→server 7, server→client 6)로 구성
