import User from "../models/User.js"

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
        query.$or = [
            { userId: regex },
            { nickname: regex },
            { email: regex}
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
export async function countUsers({ search, role, groupId }) {
    const query = { role: 'user' }
    
    if(search) {
        const regex = new RegExp(search, "i")
        query.$or = [
            { userId: regex },
            { nickname: regex },
            { email: regex}
        ]
    }
    if (groupId) query.groupId = groupId

    return User.countDocuments(query)
}

// 회원 상세 목록 조회
export async function findUserDetail(id) {
    return User.findById(id).select("-userPw")
}
