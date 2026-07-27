import express from "express"
import * as authController from "../controller/auth.js"
import { isAuth } from "../middleware/auth.js"
import { uploadProfile } from "../middleware/profile_upload.js"

const router = express.Router()

// 아이디 중복 확인
router.get("/checkId", authController.checkId)

// 회원가입
// http://127.0.0.1:3000/auth/signup
router.post("/signup", authController.signup)

// 로그인
// http://127.0.0.1:3000/auth/login
router.post("/login", authController.login)

// 로그인 유지 체크 + 회원 정보 조회
router.get("/me", isAuth, authController.me)

// 로그아웃
// http://127.0.0.1:3000/auth/logout
router.post("/logout", authController.logout)

// 회원 정보 수정
// http://127.0.0.1:3000/auth/me
router.patch("/me", isAuth, authController.meUpdate)

// 프로필 이미지 수정
router.patch(
    "/profile-image", 
    isAuth, 
    uploadProfile.single("profileImage"),
    authController.updateProfileImage
)

// 과목 생성
// http://127.0.0.1:3000/auth/subject
router.post("/subject", isAuth, authController.addSubject)

// 과목 수정
router.put("/subject", isAuth, authController.updateSubject)

// 과목 삭제
router.delete("/subject", isAuth, authController.deleteSubject)

export default router