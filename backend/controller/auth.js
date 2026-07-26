import express from "express"
import { config } from "../config.mjs"
import * as bcrypt from "bcrypt"
import * as authRepository from "../repository/auth.js"
import jwt from "jsonwebtoken"

// 파일 읽기를 위한 내장 모듈 임포트
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// ES Module 환경에서 __dirname 사용을 위한 설정
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 비속어 필터링을 위한 금칙어 목록 로드
let badWords = []
try{
    const filePath = path.join(__dirname, "../public/badwords/badwords.txt")
    const fileData = fs.readFileSync(filePath, "utf-8")

    badWords = fileData.split("\n").map(word => word.trim()).filter(word => word.length > 0)
    console.log("금칙어 목록 로드 완료:", badWords)
}catch(error){
    console.error("금칙어 목록 로드 실패: ", error)
}

// 비속어 필터링 회피 방지 (예시: ㅅ@ㅂ)
function isBannedWord(text) {
    if (!text) return false
    const cleanText = text.replace(/[^가-힣a-zA-Z0-9]/g, '')

    return badWords.some(word => cleanText.includes(word))
}


// 회원 중복 체크
export async function checkId(req, res) {
    const { userId } = req.query
    const found = await authRepository.findByUserid(userId)
    res.json({ exists: !!found })
}

// 회원가입
export async function signup(req, res) {
    const{userId, userPw, nickname, email} = req.body

    // 닉네임 비속어 검사
    if (isBannedWord(nickname)) {
        console.log(`필터링 차단: ${nickname}`)
        return res.status(400).json({message: "부적절한 닉네임입니다. 다른 닉네임을 사용해주세요"})
    }
    
    // ID 중복체크
    const found = await authRepository.findByUserid(userId)
    if(found){
        return res.status(409).json({message: `${userId}는 이미 존재하는 ID입니다.`})
    }

    // 비밀번호 해쉬화
    const hashed = bcrypt.hashSync(userPw, config.bcrypt.saltRounds)

    // 실제 가입
    const userInsertedId = await authRepository.createUser(
        {userId, userPw: hashed, nickname, email}
    )

    // 가입완료 후
    const token = await createJwtToken(userInsertedId)

    // 확인용
    console.log("회원가입 성공, 토큰발급 완료!!")
    res.status(201).json({token, userInsertedId})
}

// JWT 토큰 생성
async function createJwtToken(id) {
    return jwt.sign({id}, config.jwt.secretKey, {
        expiresIn: config.jwt.expiresInSec
    })    
}

// 로그인
export async function login(req, res) {
    const {userId, userPw} = req.body

    // ID 확인
    const user = await authRepository.findByUserid(userId)
    if(!user){
        console.log("존재하지 않는 ID 입력")
        return res.status(401).json({message: "아이디 또는 비밀번호를 확인해주세요"})
    }

    // 비밀번호 확인
    const isValidPw = await bcrypt.compare(userPw, user.userPw)
    if(!isValidPw){
        console.log("일치하지 않는 비밀번호 입력")
        return res.status(401).json({message: "아이디 또는 비밀번호를 확인해주세요"})
    }

    // 모두 일치하면 토큰발급
    const token = await createJwtToken(user._id.toString())
    
    const userObj = user.toObject()
    const { userPw: _, ...safeUser } = userObj // 비밀번호 보안처리
    
    console.log("로그인 성공 및 토큰 발급 완료")
    return res.status(200).json({token, user: safeUser})
}

// 로그인 유지 체크
export async function me(req, res) {
    const {userPw, ...safeUser} = req.user
    res.status(200).json({token: req.token, user: safeUser})
}

// 로그아웃
export async function logout(req, res) {
    console.log("로그아웃 성공")
    res.status(200).json({message: "로그아웃되었습니다."})
}

// 회원 정보 수정 [nickname, email]
export async function meUpdate(req, res) {
    const {nickname, email} = req.body

    // 닉네임 비속어 검사
    if (isBannedWord(nickname)) {
        console.log(`정보 수정 닉네임 필터링 차단: ${nickname}`)
        return res.status(400).json({message: "부적절한 닉네임입니다. 다른 닉네임을 사용해주세요"})
    }

    // 로그인 한 사용자 조회
    const user = await authRepository.findById(req.user._id)
    if (!user) {
        return res.status(404).json({message: "회원정보를 찾을 수 없습니다."})
    }

    // 수정
    const updatedUser = await authRepository.update(
        req.user._id, nickname, email
    )

    // 비밀번호 제외 응답 (보안)
    const { userPw, ...safeUser } = updatedUser

    return res.status(200).json({
        message: "회원정보가 수정되었습니다.",
        user: safeUser
    })
}

// 프로필 이미지 수정
export async function updateProfileImage(req, res) {
    if(!req.file){
        return res.status(400).json({
            message: "선택된 이미지가 없습니다."
        })
    }

    // 브라우저가 접근할 이미지 주소
    const profileImage = `/uploads/profile/${req.file.filename}`

    // 이미지 경로 DB에 저장
    const updatedUser = await authRepository.updateProfileImage(
        req.user._id, profileImage
    )

    const { userPw, ...safeUser } = updatedUser

    return res.status(200).json({
        message: "프로필 이미지가 저장되었습니다.",
        user: safeUser
    })
    
}