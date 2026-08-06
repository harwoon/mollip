import express from "express"
import * as authController from "../controller/auth.js"
import * as googleAuthController from "../controller/googleAuth.js"
import { isAuth } from "../middleware/auth.js"
import { uploadProfile } from "../middleware/profile_upload.js"

const router = express.Router()

// 아이디 중복 확인
router.get("/checkId", authController.checkId)

// 회원가입
// http://127.0.0.1:3000/auth/signup
router.post("/signup", uploadProfile.single("profileImage"), authController.signup)

// 로그인
// http://127.0.0.1:3000/auth/login
router.post("/login", authController.login)
// 구글 로그인
router.post("/google", googleAuthController.googleLogin,)

// 로그인 유지 체크 + 회원 정보 조회
router.get("/me", isAuth, authController.me)

// 로그아웃
// http://127.0.0.1:3000/auth/logout
router.post("/logout", authController.logout)

// 회원 정보 수정
// http://127.0.0.1:3000/auth/me
router.patch("/me", isAuth, authController.meUpdate)

// 프로필 이미지 수정
// http://127.0.0.1:3000/auth/profile-image
router.patch(
    "/profile-image", 
    isAuth, 
    uploadProfile.single("profileImage"),
    authController.updateProfileImage
)

// 과목 생성
// http://127.0.0.1:3000/auth/subject
router.post("/subject", isAuth, authController.addSubject)

// 과목 순서 저장
// http://127.0.0.1:3000/auth/subject/order
router.patch("/subject/order", isAuth, authController.updateSubjectOrder)

// 과목 수정
// http://127.0.0.1:3000/auth/subject/:subjectId
router.put("/subject/:id", isAuth, authController.updateSubject)

// 과목 삭제
// http://127.0.0.1:3000/auth/subject/:subjectId
router.delete("/subject/:id", isAuth, authController.deleteSubject)

// 과목 목록 조회
// http://127.0.0.1:3000/auth/subject
router.get("/subject", isAuth, authController.getSubjects)

// 유저 탈퇴 - 사용안함
// http://127.0.0.1:3000/auth/delete
// router.delete("/delete",isAuth,authController.deleteAll)

// 유저 탈퇴
// http://127.0.0.1:3000/auth/withdraw
router.patch("/withdraw",isAuth,authController.withdraw)

// 주간 그룹 변경시 알람
router.post("/weekly-group-notice/consume", isAuth, authController.consumeWeeklyGroupNotice)

export default router