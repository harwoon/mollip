import User from "../models/User.js";

// id 중복확인 및 단일 유저 조회
export async function findByUserid(userId) {
    return User.findOne({ userId });
}

// 회원가입
export async function createUser(userData) {
    const user = new User(userData);
    const savedUser = await user.save();
    return savedUser._id.toString();
}

// 로그인 유지 (ID로 찾기)
export async function findById(id) {
    return User.findById(id);
}

// 회원정보 수정
export async function update(id, nickname, email) {
    return User.findByIdAndUpdate(id, { nickname, email }, { new: true });
}

// 프로필 이미지 수정
export async function updateProfileImage(id, profileImage) {
    return User.findByIdAndUpdate(
        id,
        { profileImg: profileImage },
        { new: true },
    );
}

// 연속 학습 일수 갱신
export async function updateStreak(
    userId,
    currentStreak,
    maxStreak,
    lastStudyDate,
) {
    return User.findByIdAndUpdate(
        userId,
        {
            currentStreak,
            maxStreak,
            lastStudyDate,
        },
        { new: true },
    );
}

// 주간 총 공부시간 바탕으로 그룹 나누기위한 유저 가져오는 함수
export async function getAllUsers() {
    return User.find({
        // 탈퇴한 사용자 제외
        useYn: "Y",

        // 관리자는 그룹 배정 대상에서 제외
        role: {
            $ne: "admin"
        }
    }).select("_id groupId");
}

// 주간 유저 랭킹을 위한 함수
export async function getUserGroup(userId) {
    return User.findOne({
        _id: userId,
        role: { $ne: "admin" },

        // 탈퇴 회원 제외
        useYn: "Y"
    })
        .select("_id groupId")
        .lean();
}

export async function updateUserGroups(updates) {
    if (updates.length === 0) {
        return null;
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
    }));

    return User.bulkWrite(operations);
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
        },
    );
}

export async function getUsersByGroupId(groupId) {
    return User.find({ 
        groupId ,
        // 탈퇴 회원이 그룹 통계에 포함되지 않도록 제외
        useYn: "Y"
    }).select(
        "_id nickname profileImg groupId currentStreak",
    );
}

//유저 삭제 - 사용안함
export const deleteUserById = async (userId) => {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new Error("존재하지 않는 유저입니다.");
    }

    return deletedUser;
};

// 활성 사용자의 그룹 조회
export async function findGroupByUserId(userId) {
    return await User.findOne({
        _id: userId,
        useYn: "Y"
    })
        .select("groupId")
        .lean()
}

// 회원 탈퇴 처리 : User 문서는 삭제하지 않고 탈퇴 상태로 수정
export async function withdrawUser(userId, withdrawalReason, totalStudyTime) {
    return await User.findOneAndUpdate(
        {
            // 현재 이용 중인 사용자만 탈퇴 처리 (탈퇴사용자가 탈퇴가 아님)
            _id: userId,
            useYn: "Y"
        },
        {
            $set: {
                useYn: "N",
                withdrawalReason,
                withdrawnAt: new Date(),
                totalStudyTime,
                groupId: null,

                // 연속 학습 정보 초기화
                currentStreak: 0,
                maxStreak: 0,
                lastStudyDate: ""
            }
        },
        {
            // 수정된 User 문서 반환
            new: true
        }
    )
}