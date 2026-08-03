import express from "express"
import { config } from "../config.mjs"
import * as bcrypt from "bcrypt"
import * as authRepository from "../repository/auth.js"
import jwt from "jsonwebtoken"
import Subject from "../models/Subject.js"
import * as subjectRepository from "../repository/subject.js"
import * as studyRepository from "../repository/study.js"
import * as todoRepository from "../repository/todo.js"
import AdminLog from "../models/AdminLog.js"

// 파일 읽기를 위한 내장 모듈 임포트
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// ES Module 환경에서 __dirname 사용을 위한 설정
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 비속어 필터링을 위한 금칙어 목록 로드
let badWords = []
try {
    const filePath = path.join(__dirname, "../public/badwords/badwords.txt")
    const fileData = fs.readFileSync(filePath, "utf-8")

    badWords = fileData.split("\n").map(word => word.trim()).filter(word => word.length > 0)
    console.log("금칙어 목록 로드 완료")
} catch (error) {
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
    const { userId, userPw, nickname, email } = req.body

    // 닉네임 비속어 검사
    if (isBannedWord(nickname)) {
        console.log(`필터링 차단: ${nickname}`)
        return res.status(400).json({ message: "부적절한 닉네임입니다. 다른 닉네임을 사용해주세요" })
    }

    // ID 중복체크
    const found = await authRepository.findByUserid(userId)
    if (found) {
        return res.status(409).json({ message: `${userId}는 이미 존재하는 ID입니다.` })
    }

    // 비밀번호 해쉬화
    const hashed = bcrypt.hashSync(userPw, config.bcrypt.saltRounds)

    // 실제 가입
    const userInsertedId = await authRepository.createUser(
        { userId, userPw: hashed, nickname, email }
    )

    const newLog = await AdminLog.create({
        type: 'SIGNUP',
        userId: userId,
        message: `${nickname}님이 서비스를 가입했습니다.`
    })

    // req.app.get('io').to('admin_room').emit('newAdminLog', newLog)
    // 서버에 등록된 Socket.io 객체 가져오기 - 승아 수정 79~86
    const io = req.app.get("io")

    // Socket.io가 있을 때만 관리자 방에 실시간 로그 전송
    if (io) {
        io.to("admin_room").emit("newAdminLog", newLog)
    }

    // 가입완료 후
    const token = await createJwtToken(userInsertedId)

    // 확인용
    console.log("회원가입 성공, 토큰발급 완료!!")
    res.status(201).json({ token, userInsertedId })
}

// JWT 토큰 생성
async function createJwtToken(id) {
    return jwt.sign({ id }, config.jwt.secretKey, {
        expiresIn: config.jwt.expiresInSec
    })
}

// 로그인
export async function login(req, res) {
    const { userId, userPw } = req.body

    // ID 확인
    const user = await authRepository.findByUserid(userId)
    if (!user) {
        console.log("존재하지 않는 ID 입력")
        return res.status(401).json({ message: "아이디 또는 비밀번호를 확인해주세요" })
    }

    // 탈퇴한 회원 로그인 차단
    if (user.useYn === "N") {
        return res.status(403).json({message: "탈퇴한 회원입니다."})
    }

    // 비밀번호 확인
    const isValidPw = await bcrypt.compare(userPw, user.userPw)
    if (!isValidPw) {
        console.log("일치하지 않는 비밀번호 입력")
        return res.status(401).json({ message: "아이디 또는 비밀번호를 확인해주세요" })
    }

    // 모두 일치하면 토큰발급
    const token = await createJwtToken(user._id.toString())

    const userObj = user.toObject()
    const { userPw: _, ...safeUser } = userObj // 비밀번호 보안처리

    console.log("로그인 성공 및 토큰 발급 완료")
    return res.status(200).json({ token, user: safeUser })
}

// 로그인 유지 체크
export async function me(req, res) {
    // req.user는 Mongoose 문서이므로 일반 객체로 변환 후에 아래 비밀번호 제외하여 분리과정 진행해야함
    const userObj = req.user.toObject()

    const { userPw, ...safeUser } = userObj
    res.status(200).json({ token: req.token, user: safeUser })
}

// 로그아웃
export async function logout(req, res) {
    console.log("로그아웃 성공")
    res.status(200).json({ message: "로그아웃되었습니다." })
}

// 회원 정보 수정 [nickname, email]
export async function meUpdate(req, res) {
    const { nickname, email } = req.body

    // 닉네임 비속어 검사
    if (isBannedWord(nickname)) {
        console.log(`정보 수정 닉네임 필터링 차단: ${nickname}`)
        return res.status(400).json({ message: "부적절한 닉네임입니다. 다른 닉네임을 사용해주세요" })
    }

    // 로그인 한 사용자 조회
    const user = await authRepository.findById(req.user._id)
    if (!user) {
        return res.status(404).json({ message: "회원정보를 찾을 수 없습니다." })
    }

    // 수정
    const updatedUser = await authRepository.update(
        req.user._id, nickname, email
    )

    const userObj = updatedUser.toObject() // 몽구스 객체 일반 객체로 수정

    // 비밀번호 제외 응답 (보안)
    const { userPw, ...safeUser } = userObj

    return res.status(200).json({
        message: "회원정보가 수정되었습니다.",
        user: safeUser
    })
}

// 프로필 이미지 수정
export async function updateProfileImage(req, res) {
    if (!req.file) {
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

    const userObj = updatedUser.toObject() // 몽구스 객체 일반 객체로 수정

    const { userPw, ...safeUser } = userObj

    return res.status(200).json({
        message: "프로필 이미지가 저장되었습니다.",
        user: safeUser
    })

}

// 유저 과목 추가
export async function addSubject(req, res) {
    const { subjectName, subjectColor } = req.body
    const userId = req.user._id

    if (!subjectName || subjectName.trim() === "") {
        console.log("과목명 미입력 차단")
        return res.status(400).json({ message: "과목명을 입력해주세요." })
    }

    const currentSubjects = await subjectRepository.findActiveSubjectsByUser(userId)

    // 과목 개수 5개 제한
    if (currentSubjects.length >= 5) {
        return res.status(400).json({ message: "과목은 최대 5개까지 설정 가능합니다." })
    }

    // 과목 컬러 중복 검사
    const isColorUsed = currentSubjects.some(subject => subject.subjectColor === subjectColor)
    if (isColorUsed) {
        console.log(`컬러 중복 차단: ${subjectColor}`)
        return res.status(400).json({ message: "해당 컬러는 이미 사용중입니다." })
    }

    // 과목명 중복 검사
    // 전체 과목을 가져와서 동일한 과목명을 가진 데이터 있는지 확인
    // 데이터 존재시 해당 데이터를 수정
    const allSubjects = await subjectRepository.findSubjectsByUser(userId)

    const existingSubject = allSubjects.find(sub => sub.subjectName === subjectName.trim())

    if (existingSubject) {
        const updatedSubject = await subjectRepository.updateSubject(
            existingSubject._id,
            subjectName.trim(),
            subjectColor
        )

        console.log("기존 과목 복구 및 수정 성공!")
        return res.status(200).json({
            message: "과목이 정상적으로 추가되었습니다.", // 사용자에겐 추가되었다고 표시
            subject: updatedSubject
        })
    } else {
        const newSubject = await subjectRepository.createSubject({
            user: userId,
            subjectName: subjectName.trim(),
            subjectColor: subjectColor
        })

        console.log("새 과목 추가 성공!")
        return res.status(201).json({
            message: "과목이 정상적으로 추가되었습니다.",
            subject: newSubject
        })
    }
}

// 유저 과목 수정
export async function updateSubject(req, res) {
    const subjectId = req.params.id
    const { subjectName, subjectColor } = req.body
    const userId = req.user._id

    // 과목 존재 여부 및 내 과목 권한 확인
    const subject = await subjectRepository.findBySubjectId(subjectId)
    if (!subject || subject.useYn === 'N') {
        return res.status(404).json({ message: "존재하지 않거나 이미 삭제된 과목입니다." })
    }
    if (subject.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: "수정 권한이 없습니다." })
    }

    // 과목명 빈 값 검사
    if (!subjectName || subjectName.trim() === "") {
        return res.status(400).json({ message: "과목명을 입력해주세요." })
    }


    const currentSubjects = await subjectRepository.findActiveSubjectsByUser(userId)

    // 과목명 중복 검사 (기존 과목명 제외)
    const isNameUsed = currentSubjects.some(
        (sub) => sub.subjectName === subjectName.trim() && sub._id.toString() !== subjectId
    )
    if (isNameUsed) {
        return res.status(400).json({ message: "이미 존재하는 과목명입니다." })
    }

    // 컬러 중복 검사 (기존 컬러 사용 가능)
    const currentSubject = await subjectRepository.findActiveSubjectsByUser(userId)
    const isColorUsed = currentSubject.some(
        (sub) => sub.subjectColor === subjectColor && sub._id.toString() !== subjectId
    )
    if (isColorUsed) {
        return res.status(400).json({ message: "해당 컬러는 이미 사용중입니다." })
    }

    // DB에 수정 반영
    const updateSubject = await subjectRepository.updateSubject(
        subjectId,
        subjectName.trim(),
        subjectColor
    )

    console.log("과목 수정 완료!")
    return res.status(200).json({
        message: "과목이 정상적으로 수정되었습니다.",
        subject: updateSubject
    })
}

// 유저 과목 삭제 (Soft Delete)
export async function deleteSubject(req, res) {
    const subjectId = req.params.id
    const userId = req.user._id

    // 1. 과목 존재 여부 및 권한 확인
    const subject = await subjectRepository.findBySubjectId(subjectId)
    if (!subject || subject.useYn === 'N') {
        return res.status(404).json({ message: "이미 삭제되었거나 없는 과목입니다." })
    }
    if (subject.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: "삭제 권한이 없습니다." })
    }

    // 2. 상태를 'N'으로 변경하여 삭제 처리
    await subjectRepository.deleteSubject(subjectId)

    console.log("과목 삭제(Soft Delete) 완료!")
    return res.status(200).json({ message: "과목이 삭제되었습니다." })
}

// 유저 과목 목록 조회
export async function getSubjects(req, res) {
    const userId = req.user._id

    const subjects = await subjectRepository.findActiveSubjectsByUser(userId)

    console.log("과목 목록 조회 성공!")
    return res.status(200).json({
        message: "과목 목록을 성공적으로 불러왔습니다.",
        subjects: subjects
    })
}

// // 유저 탈퇴- 사용안함
// export async function deleteAll(req, res) {
//     try {
//         const userId = req.user._id

//         await studyRepository.deleteMany(userId)
//         await subjectRepository.deleteMany(userId)
//         await todoRepository.deleteMany(userId)

//         await authRepository.deleteUserById(userId)

//         const newLog = await AdminLog.create({
//             type: 'WITHDRAW',
//             userId: userId,
//             message: `${nickname}님이 서비스를 탈퇴했습니다.`
//         })

//         req.app.get('io').to('admin_room').emit('newAdminLog', newLog)

//         return res.status(200).json({ message: "모든 정보가 삭제되었습니다." })
//     } catch (error) {
//         console.error("회원탈퇴 에러:", error)
//         return res.status(500).json({ message: "회원탈퇴 처리 중 오류가 발생했습니다." })
//     }
// }


// 회원 탈퇴
export async function withdraw(req, res) {
    const userId = req.user._id

    const {confirmationText, withdrawalReason} = req.body

    // 탈퇴 확인 문구 검사
    if (confirmationText !== "탈퇴하겠습니다") {
        return res.status(400).json({
            message: '"탈퇴하겠습니다"를 정확히 입력해주세요.'
        })
    }

    // 탈퇴 사유 검사
    if (!withdrawalReason || !withdrawalReason.trim()) {
        return res.status(400).json({
            message: "탈퇴 사유를 입력해주세요."
        })
    }

    try {
        // Study 기록을 삭제하기 전에 전체 공부시간 계산
        const totalStudyTime = await studyRepository.getTotalStudyTimeByUserId(userId)

        // User는 삭제하지 않고 탈퇴 상태로 UPDATE
        const withdrawnUser = await authRepository.withdrawUser(
            userId,
            withdrawalReason.trim(),
            totalStudyTime
        )

        // 이미 탈퇴했거나 사용자를 찾지 못한 경우
        if (!withdrawnUser) {
            return res.status(404).json({
                message: "회원을 찾을 수 없거나 이미 탈퇴한 회원입니다."
            })
        }

        // 탈퇴 회원의 상세 데이터 삭제
        await Promise.all([
            // 공부 기록 삭제- 260803 수정
            // studyRepository.deleteMany(userId),

            // 등록 과목 삭제
            subjectRepository.deleteMany(userId),

            // TodoList 삭제
            todoRepository.deleteMany(userId)
        ])

        // 관리자 화면에서 탈퇴정보 뿌려주기위해 AdminLog에 저장
        const newLog = await AdminLog.create({
            type: "WITHDRAW",

            // ObjectId가 아닌 로그인 아이디를 저장
            userId: withdrawnUser.userId,

            message: `${withdrawnUser.nickname}님이 서비스를 탈퇴했습니다.`
            
            // type: 'WITHDRAW',
            // userId: userId,
            // message: `${req.user.nickname}님이 서비스를 탈퇴했습니다.`
        })

        // Socket.io가 설정되어 있을 때만 관리자에게 알림
        const io = req.app.get("io")
        if (io) {
            io.to("admin_room").emit(
                "newAdminLog",
                newLog
            )
        }
        return res.status(200).json({
            message: "회원 탈퇴가 완료되었습니다."
        })

    } catch (error) {
        console.error("회원 탈퇴 오류:", error)
        return res.status(500).json({
            message: "회원 탈퇴 처리 중 오류가 발생했습니다."
        })
    }
}