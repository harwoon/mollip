import User from "../models/User.js"

// id 중복확인 및 단일 유저 조회
export async function findByUserid(userId) {
    return User.findOne({ userId })
}

// 회원가입
export async function createUser(userData) {
    const user = new User(userData)
    const savedUser = await user.save()
    return savedUser._id.toString()
}

// 로그인 유지 (ID로 찾기)
export async function findById(id) {
    return User.findById(id)
}

// 회원정보 수정
export async function update(id, nickname, email) {
    return User.findByIdAndUpdate(
        id,
        { nickname, email },
        { new: true }
    )
}

// 프로필 이미지 수정
export async function updateProfileImage(id, profileImage) {
    return User.findByIdAndUpdate(
        id,
        { profileImg: profileImage },
        { new: true }
    )
}

// 연속 학습 일수 갱신
export async function updateStreak(userId, currentStreak, maxStreak, lastStudyDate) {
    return User.findByIdAndUpdate(
        userId,
        {
            currentStreak,
            maxStreak,
            lastStudyDate
        },
        { new: true }
    )
}

// 주간 총 공부시간 바탕으로 그룹 나누기위한 유저 가져오는 함수
export async function getAllUsers() {
    return User.find().select("_id groupId")
}
// 주간 유저 랭킹을 위한 함수 
export async function getUserGroup(userId) {
    return User.findById(userId).select("_id groupId").lean()
}

export async function updateUserGroups(updates) {
    if (updates.length === 0) {
        return null
    }

    const operations = updates.map((update) => ({
        updateOne: {
            filter: {
                _id: update.userId,
            },
            update: {
                $set: {
                    groupId: update.groupId,
                },
            },
        },
    }))

    return User.bulkWrite(operations)
}

export async function resetExpiredStreaks(yesterdayString) {
    return User.updateMany(
        {
            currentStreak: {
                $gt: 0,
            },
            $or: [
                {
                    lastStudyDate: {
                        $lt: yesterdayString,
                    },
                },
                {
                    lastStudyDate: "",
                },
            ],
        },
        {
            $set: {
                currentStreak: 0,
            },
        }
    )
}

export async function getUsersByGroupId(groupId) {
    return User.find({groupId,}).select("_id nickname profileImg groupId currentStreak")
}