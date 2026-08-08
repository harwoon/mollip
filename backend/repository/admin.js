import redisClient from "../db/redis.js"
import User from "../models/User.js"
import Group from "../models/Group.js"
import AdminLog from "../models/AdminLog.js"
import { config } from "../config.mjs"

const dormantGroupId =
    config.group.dormantId

// 전체 사용자 수 조회 (role: 'user'인 사용자)
// 전체 사용자 수 조회
export async function countAllUsers() {
    // 현재 시점으로부터 정확히 7일 전
    const oneWeekAgo = new Date()

    oneWeekAgo.setDate(
        oneWeekAgo.getDate() - 7,
    )

    const dormantGroupId =
        "6a6c35fa39f4827ac141db88"

    const [
        totalUserCount,
        withdrawnUserCount,
        dormantUserCount,
        previousTotalUserCount,
    ] = await Promise.all([
        // 현재 탈퇴하지 않은 전체 일반 회원 수
        User.countDocuments({
            role: "user",
            useYn: "Y",
        }),

        // 현재 탈퇴 회원 수
        User.countDocuments({
            role: "user",
            useYn: "N",
        }),

        // 현재 휴면 회원 수
        User.countDocuments({
            role: "user",
            useYn: "Y",
            groupId: dormantGroupId,
        }),

        // 7일 전 당시 존재했던 사용자 수
        User.countDocuments({
            role: "user",

            // 7일 전에 이미 가입한 사용자
            createdAt: {
                $lte: oneWeekAgo,
            },

            // 아직 탈퇴하지 않았거나
            // 7일 전 이후에 탈퇴한 사용자
            $or: [
                {
                    withdrawnAt: null,
                },
                {
                    withdrawnAt: {
                        $gt: oneWeekAgo,
                    },
                },
            ],
        }),
    ])

    const normalUserCount =
        totalUserCount - dormantUserCount

    // 현재 사용자 수 - 7일 전 사용자 수
    const userCountDiff =
        totalUserCount -
        previousTotalUserCount

    return {
        totalUserCount,
        previousTotalUserCount,
        userCountDiff,

        withdrawnUserCount,
        normalUserCount,
        dormantUserCount,
    }
}

// 검색/그룹 필터가 적용된 전체 사용자 조회
// (정렬·페이지네이션은 여기서 하지 않고, 이후 controller에서 계산값까지 합친 뒤 처리함)
export async function findAllMatchingUsers({ search, groupId }) {
    const query = { role: "user" }

    if (search) {
        const regex = new RegExp(search, "i")

        // 검색어와 그룹명이 일치하는 그룹들의 ID 조회 (소속 그룹 검색용)
        const matchedGroups = await Group.find({ groupName: regex }).select("_id")
        const matchedGroupIds = matchedGroups.map(g => g._id.toString())

        // 닉네임 또는 소속 그룹명 중 하나라도 일치하면 검색 결과에 포함
        query.$or = [
            { nickname: regex },
            { groupId: { $in: matchedGroupIds } }
        ]
    }
    if (groupId) query.groupId = groupId

    return User.find(query).select("-userPw")
}

// 회원 상세 목록 조회
export async function findUserDetail(id) {
    return User.findById(id).select("-userPw")
}


// 관리자 그룹별 Todo 통계용 사용자 조회
export async function getAllUsersWithGroup() {
    return User.find({
        role: "user"
    })
        .select("_id groupId")
        .lean()
}

// 관리자 그룹별 Todo 통계용 전체 그룹 조회
export async function findAllGroups() {
    return Group.find()
        .select("_id groupName groupColor")
        .lean()
}

// 현재 공부 중인 전체 사용자 ID 목록 조회 (Redis)
export async function getActiveUserIds() {

    // 저장된 Redis 키를 전부 찾기
    const keys = await redisClient.keys("study:*")
    const activeUserIds = new Set()

    for (const key of keys) {
        // 각 그룹 키마다 hgetall로 "그룹에서 지금 공부 중인 사용자들" 가져옴
        const users = await redisClient.hgetall(key)
        Object.keys(users).forEach(userId => activeUserIds.add(userId))
    }

    return [...activeUserIds]
}

// 관리자 그룹별 주간 총공부시간용 사용자 정보 가져오기
export async function findAllUserGroups() {
    return User.find({
        role: "user",
    })
        .select("_id groupId")
        .lean()
}

export async function getAllLog(){
    return AdminLog.find().sort({createdAt: -1})
}