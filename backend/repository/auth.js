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
export async function update(id, nickname,email) {
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
        { profileImg:profileImage },
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