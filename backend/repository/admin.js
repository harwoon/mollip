import redisClient from "../db/redis.js"
import User from "../models/User.js"
import Group from "../models/Group.js"
import AdminLog from "../models/AdminLog.js"

// 전체 사용자 수 조회 (role: 'user'인 사용자)
export async function countAllUsers() {
    return User.countDocuments({ role: 'user' })
}

// 회원 목록 조회 (검색/필터/정렬/페이지네이션)
export async function findUsers({ search, groupId, sortBy, sortOrder, skip, limit }) {
    // DB에 던질 검색 조건 객체를 일반 유저 대상으로 고정
    const query = { role: "user"}

    // 아래에서 조건이 있을 때만 하나씩 채워 넣음
    if(search) {
        const regex = new RegExp(search, 'i')

        // 검색어와 이름이 일치하는 그룹들의 ID 조회 (소속 그룹 검색용)
        const matchedGroups = await Group.find({ groupName: regex }).select("_id")
        const matchedGroupIds = matchedGroups.map(g => g._id.toString())

        // 닉네임에 일치하거나, 소속 그룹명이 일치하는 유저
        query.$or = [
            { nickname: regex },
            { groupId: { $in: matchedGroupIds } }
        ]
    }
    if(groupId) query.groupId = groupId

    return User.find(query)
        .select("-userPw")          // 비밀번호 제외 모든 필드 정보 제공
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
}

// 회원 목록 개수
export async function countUsers({ search, groupId }) {
    const query = { role: 'user' }
    
    if(search) {
        const regex = new RegExp(search, "i")

        const matchedGroups = await Group.find({ groupName: regex }).select("_id")
        const matchedGroupIds = matchedGroups.map(g => g._id.toString())

        query.$or = [
            { nickname: regex },
            { groupId: { $in: matchedGroupIds } }
        ]
    }
    if (groupId) query.groupId = groupId

    return User.countDocuments(query)
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

// 현재 공부 중인 전체 유저 ID 목록 조회 (Redis)
export async function getActiveUserIds() {

    // 저장된 Redis 키를 전부 찾기
    const keys = await redisClient.keys("study:*")
    const activeUserIds = new Set()

    for (const key of keys) {
        // 각 그룹 키마다 hgetall로 "그룹에서 지금 공부 중인 유저들" 가져옴
        const users = await redisClient.hgetall(key)
        Object.keys(users).forEach(userId => activeUserIds.add(userId))
    }

    return [...activeUserIds]
}

// 관리자 그룹별 주간 총공부시간용 유저 정보 가져오기
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