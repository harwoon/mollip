// [회원 분류]
// 7일 미학습 회원: 마지막 공부일로 부터 7일 이상 ~ 14일 미만, 휴면 제외
// 14일 미학습 회원: 마지막 공부일로 부터 14일 이상 ~ 30일 미만. 휴면 제외
// 휴면 회원: 그룹 ID가 DORMANT_GROUP_ID
import mongoose from "mongoose"
import User from "../models/User.js"
import transporter from "../util/mailer.js"
import { getMemberStatusMailTemplate } from "../util/memberStatusMailTemplates.js"
import path from "path"
import { fileURLToPath } from "url"

// 이미지
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MAIL_IMAGES = {
    inactive7: {
        filename: "state7.png",
        path: path.resolve(__dirname, "../public/images/state7.png"),
        cid: "mollip-state7"
    },

    inactive14: {
        filename: "state14.png",
        path: path.resolve(__dirname, "../public/images/state14.png"),
        cid: "mollip-state14"
    },

    dormant: {
        filename: "state30.png",
        path: path.resolve(__dirname, "../public/images/state30.png"),
        cid: "mollip-state30"
    }
}

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
            // 마지막 접속일 = 마지막 공부일
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

// 선택한 회원들에게 상태별 메일 발송
export async function sendMemberStatusMails({type, userIds}) {
    // 허용된 메일 유형인지 확인
    if (!MAIL_TYPES.includes(type)) {
        const error = new Error("올바르지 않은 메일 유형입니다.")

        error.status = 400
        throw error
    }

    // 회원 ID 목록이 배열인지 확인
    if (!Array.isArray(userIds)) {
        const error = new Error("회원 ID 목록이 올바르지 않습니다.")

        error.status = 400
        throw error
    }

    // 선택한 회원이 없는 경우
    if (userIds.length === 0) {
        const error = new Error("메일을 발송할 회원을 선택해주세요.")

        error.status = 400
        throw error
    }

    // 중복 회원 ID 제거
    const uniqueUserIds = [
        ...new Set(userIds)
    ]

    // MongoDB ObjectId 형식 확인
    const hasInvalidId = uniqueUserIds.some(
        (userId) => !mongoose.Types.ObjectId.isValid(
            userId
        )
    )

    if (hasInvalidId) {
        const error = new Error(
            "올바르지 않은 회원 ID가 포함되어 있습니다."
        )

        error.status = 400
        throw error
    }

    const dormantGroupId =
        process.env.DORMANT_GROUP_ID

    if (!dormantGroupId) {
        throw new Error(
            "DORMANT_GROUP_ID 환경변수가 설정되지 않았습니다."
        )
    }

    // 선택한 정상 회원 정보 조회
    const users = await User.find({
        _id: {
            $in: uniqueUserIds
        },
        role: "user",
        useYn: "Y"
    })
        .select(
            "_id nickname email groupId lastStudyDate"
        )
        .lean()

    // 메일 발송 시점에도 해당 유형인지 다시 확인
    const validUsers = users.filter(
        (user) =>
            getUserStatusType(
                user,
                dormantGroupId
            ) === type
    )

    if (validUsers.length === 0) {
        const error = new Error(
            "현재 해당 상태에 속하는 회원이 없습니다."
        )

        error.status = 400
        throw error
    }

    // 회원별 메일 발송
    const mailRequests =
        validUsers.map(async (user) => {
            // 이메일이 없는 회원 방어
            if (!user.email) {
                throw new Error(
                    `${user.nickname} 회원의 이메일이 없습니다.`
                )
            }

            // 회원 상태에 맞는 메일 양식 생성
            const mailImage = MAIL_IMAGES[type]

            const template = getMemberStatusMailTemplate(
                type,
                user.nickname,
                mailImage?.cid
            )

            // 실제 메일 발송
            await transporter.sendMail({
                from: {
                    name: process.env.MAIL_FROM_NAME || "Mollip",
                    address:
                        process.env.MAIL_FROM_ADDRESS ||
                        process.env.MAIL_USER
                },

                to: user.email,
                subject: template.subject,
                html: template.html,

                attachments: mailImage
                    ? [
                        {
                            filename: mailImage.filename,
                            path: mailImage.path,
                            cid: mailImage.cid,
                            contentDisposition: "inline"
                        }
                    ]
                    : []
            })

            return {
                userId: user._id.toString(),
                nickname: user.nickname
            }
        })

    // 일부 회원 발송 실패 시에도 나머지는 계속 처리
    const results = await Promise.allSettled(mailRequests)

    const successes = []
    const failures = []

    results.forEach((result, index) => {
        const user = validUsers[index]

        if (result.status === "fulfilled") {
            successes.push({
                userId: user._id.toString(),
                nickname: user.nickname
            })

            return
        }

        failures.push({
            userId: user._id.toString(),
            nickname: user.nickname,
            reason:
                result.reason?.message || "메일 발송 실패"
        })
    })

    // 발송 결과 반환
    return {
        requestedCount: uniqueUserIds.length,
        validCount: validUsers.length,
        successCount: successes.length,
        failureCount: failures.length,
        successes,
        failures
    }
}

// 7일 / 14일 / 휴면 회원을 한 번에 메일 발송
export async function sendAllMemberStatusMails({
    groups
}) {
    // 요청 데이터 형식 확인
    if (
        !groups ||
        typeof groups !== "object"
    ) {
        const error = new Error(
            "회원 그룹 정보가 올바르지 않습니다."
        )

        error.status = 400
        throw error
    }

    // 타입별 선택 회원 목록
    const inactive7 =
        Array.isArray(groups.inactive7)
            ? groups.inactive7
            : []

    const inactive14 =
        Array.isArray(groups.inactive14)
            ? groups.inactive14
            : []

    const dormant =
        Array.isArray(groups.dormant)
            ? groups.dormant
            : []

    // 전체 선택 회원 수
    const totalRequestedCount =
        inactive7.length +
        inactive14.length +
        dormant.length

    // 아무도 선택하지 않은 경우
    if (totalRequestedCount === 0) {
        const error = new Error(
            "메일을 발송할 회원을 선택해주세요."
        )

        error.status = 400
        throw error
    }

    // 선택된 타입만 발송 작업에 추가
    const mailTasks = []

    if (inactive7.length > 0) {
        mailTasks.push(
            sendMemberStatusMails({
                type: "inactive7",
                userIds: inactive7
            })
        )
    }

    if (inactive14.length > 0) {
        mailTasks.push(
            sendMemberStatusMails({
                type: "inactive14",
                userIds: inactive14
            })
        )
    }

    if (dormant.length > 0) {
        mailTasks.push(
            sendMemberStatusMails({
                type: "dormant",
                userIds: dormant
            })
        )
    }

    // 타입별 메일을 동시에 발송
    const results =
        await Promise.all(mailTasks)

    // 전체 성공 목록 합치기
    const successes =
        results.flatMap(
            (result) =>
                result.successes
        )

    // 전체 실패 목록 합치기
    const failures =
        results.flatMap(
            (result) =>
                result.failures
        )

    // 전체 유효 회원 수 계산
    const validCount =
        results.reduce(
            (sum, result) =>
                sum + result.validCount,
            0
        )

    return {
        requestedCount:
            totalRequestedCount,

        validCount,

        successCount:
            successes.length,

        failureCount:
            failures.length,

        successes,
        failures
    }
}