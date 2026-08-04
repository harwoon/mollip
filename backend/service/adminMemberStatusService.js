// [회원 분류]
// 7일 미학습 회원: 마지막 공부일로 부터 7일 이상 ~ 14일 미만, 휴면 제외
// 14일 미학습 회원: 마지막 공부일로 부터 14일 이상 ~ 30일 미만. 휴면 제외
// 휴면 회원: 그룹 ID가 DORMANT_GROUP_ID
import mongoose from "mongoose"
import User from "../models/User.js"
// import transporter from "../util/mailer.js"
// import { getMemberStatusMailTemplate } from "../util/memberStatusMailTemplates.js"

// 하루를 밀리초로 변환
const DAY_MS = 1000 * 60 * 60 * 24

// 메일 유형
const MAIL_TYPES = [
    "inactive7",
    "inactive14",
    "dormant"
]

// 날짜를 YYYY-MM-DD 기준 자정으로 변환
function parseStudyDate(dateString) {
    // 값이 없거나 문자열이 아니면 null
    if(
        !dateString || typeof dateString !== "string"
    ){
        return null
    }

    // YYYY-MM-DD 형식 확인
    const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    if (!isValidFormat) {
        return null
    }
    const parsedDate = new Date(`${dateString}T00:00:00`)

    // 유효하지 않은 날짜 방어
    if (Number.isNaN(parsedDate.getTime())) {
        return null
    }
    return parsedDate
} 

// 오늘 날짜의 자정 구하기
function getTodayStart() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
}

// 마지막 공부일로부터 지난 일수 계산
function calculateInactiveDays(lastStudyDate) {
    const studyDate = parseStudyDate(lastStudyDate)

    if (!studyDate) {
        return null
    }

    const today = getTodayStart()

    return Math.floor(
        (today.getTime() - studyDate.getTime()) / DAY_MS
    )
}


// 사용자 한 명이 현재 어떤 유형인지 확인
function getUserStatusType(user, dormantGroupId) {
    // 휴면 그룹 회원을 가장 먼저 확인
    if (
        String(user.groupId) === String(dormantGroupId)
    ) {
        return "dormant"
    }

    const inactiveDays = calculateInactiveDays(
        user.lastStudyDate
    )

    // 마지막 공부일이 없는 회원
    if (inactiveDays === null) {
        return null
    }

    // 미래 날짜가 잘못 저장된 경우 제외
    if (inactiveDays < 0) {
        return null
    }

    // 14일 이상 30일 미만
    if (
        inactiveDays >= 14 && inactiveDays < 30
    ) {
        return "inactive14"
    }

    // 7일 이상 14일 미만
    if (
        inactiveDays >= 7 && inactiveDays < 14
    ) {
        return "inactive7"
    }

    return null
}


// 관리자용 회원 현황 조회
export async function getMemberStatusUsers() {
    const dormantGroupId = process.env.DORMANT_GROUP_ID

    if (!dormantGroupId) {
        throw new Error("DORMANT_GROUP_ID 환경변수가 설정되지 않았습니다.")
    }

    // 탈퇴하지 않은 일반 회원만 조회
    const users = await User.find({
        role: "user",
        useYn: "Y"
    })
        .select("_id nickname groupId lastStudyDate")
        .lean()

    const result = {
        inactive7: [],
        inactive14: [],
        dormant: []
    }

    for (const user of users) {
        const type = getUserStatusType(user, dormantGroupId)

        if (!type) {
            continue
        }

        result[type].push({
            _id: user._id,
            nickname: user.nickname,
            lastStudyDate: user.lastStudyDate || null
        })
    }

    // 닉네임 기준 정렬
    result.inactive7.sort((a, b) =>
        a.nickname.localeCompare(b.nickname)
    )

    result.inactive14.sort((a, b) =>
        a.nickname.localeCompare(b.nickname)
    )

    result.dormant.sort((a, b) =>
        a.nickname.localeCompare(b.nickname)
    )

    return {
        inactive7: result.inactive7,
        inactive14: result.inactive14,
        dormant: result.dormant,

        counts: {
            inactive7: result.inactive7.length,
            inactive14: result.inactive14.length,
            dormant: result.dormant.length
        }
    }
}

