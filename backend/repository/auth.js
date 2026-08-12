import User from "../models/User.js";
import { config } from "../config.mjs"


// 휴면 회원 그룹이동
export async function assignDormantUsers(
    cutoffDateString,
    cutoffCreatedAt,
) {
    return User.updateMany(
        {
            // 일반 회원만
            role: "user",

            // 탈퇴하지 않은 회원만
            useYn: "Y",

            // 이미 휴면 그룹인 회원은 제외
            groupId: {
                $ne: config.group.dormantId,
            },

            $or: [
                {
                    /*
                     * 한 번이라도 공부한 회원
                     *
                     * cutoffDateString보다 이전에
                     * 마지막으로 공부한 회원
                     */
                    lastStudyDate: {
                        $ne: "",
                        $lte: cutoffDateString,
                    },
                },
                {
                    /*
                     * 가입 후 한 번도 공부하지 않은 회원
                     *
                     * 가입한 지 30일이 지난 경우에만
                     * 휴면 처리
                     */
                    lastStudyDate: {
                        $in: ["", null],
                    },

                    createdAt: {
                        $lt: cutoffCreatedAt,
                    },
                },
            ],
        },
        {
            $set: {
                groupId:
                    config.group.dormantId,
            },
        },
    )
}

// Google 고유 ID로 사용자 조회
export async function findByGoogleId(
    googleId,
) {
    return User.findOne({
        googleId,
        useYn: "Y",
    })
}

// 이메일로 활성 사용자 조회
export async function findByEmail(
    email,
) {
    return User.findOne({
        email,
        useYn: "Y",
    })
}

// Google 회원 생성
export async function createGoogleUser(
    userData,
) {
    return User.create(userData)
}

// id 중복확인 및 단일 사용자 조회
export async function findByUserid(userId) {
    const trimmedUserId =
        String(userId ?? "").trim()

    return User.findOne({
        userId: trimmedUserId,
        useYn: "Y",
    }).collation({
        locale: "en",
        strength: 2,
    })
}


// 회원가입
export async function createUser(userData) {
    const user = new User(userData);
    const savedUser = await user.save();
    return savedUser._id.toString();
}
// 신규가입 및 그룹 배정 알림 저장
export async function updateWeeklyGroupNotice(
    userId,
    weeklyGroupNotice,
) {
    return User.findByIdAndUpdate(
        userId,
        {
            $set: {
                weeklyGroupNotice,
            },
        },
        {
            new: true,
            runValidators: true,
        },
    )
}

// 로그인 유지 (ID로 찾기)
export async function findById(id) {
    return User.findById(id);
}

// 휴면 해제에서는 학습/연속 기록 등 다른 필드를 건드리지 않고 groupId만 변경합니다.
export async function reactivateDormantGroupOnly(
    userId,
    defaultGroupId,
    defaultGroupName,
    weekStart,
) {
    return User.findOneAndUpdate(
        {
            _id: userId,
            useYn: "Y",
            groupId:
                config.group.dormantId,
        },
        {
            $set: {
                groupId:
                    defaultGroupId,

                weeklyGroupNotice: {
                    status: "RETURN",

                    weekStart,

                    previousGroupId:
                        String(
                            config.group
                                .dormantId,
                        ),

                    previousGroupName:
                        "휴면",

                    currentGroupId:
                        String(
                            defaultGroupId,
                        ),

                    currentGroupName:
                        defaultGroupName,

                    isRead: false,

                    assignedAt:
                        new Date(),
                },
            },
        },
        {
            new: true,
            runValidators: true,
        },
    )
}

// 회원정보 수정
export async function update(id, nickname, email) {
    return User.findByIdAndUpdate(id, { nickname, email }, { new: true });
}

// 프로필 이미지 수정
export async function updateProfileImage(id, profileImg) {
    return User.findByIdAndUpdate(
        id,
        { profileImg },
        { new: true },
    );
}

// 비밀번호 변경
export async function updatePassword(id, userPw) {
    return User.findByIdAndUpdate(
        id,
        { userPw },
        { new: true },
    )
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

// 주간 총 공부시간 바탕으로 그룹 나누기위한 사용자 가져오는 함수
export async function getAllUsers() {
    return User.find({
        useYn: "Y",

        role: {
            $ne: "admin",
        },

        // 휴면 회원은 주간 그룹 배정에서 제외
        groupId: {
            $ne: config.group.dormantId,
        },
    }).select("_id groupId")
}
// 공부시간 생기면 휴면 그룹 해제하기
export async function reactivateDormantUser(
    userId,
    groupId,
    groupName,
    weekStart,
) {
    return User.updateOne(
        {
            _id: userId,
            role: "user",
            useYn: "Y",
            groupId:
                config.group.dormantId,
        },
        {
            $set: {
                groupId:
                    String(groupId),

                weeklyGroupNotice: {
                    status:
                        "RETURN",

                    weekStart,

                    previousGroupId:
                        String(
                            config.group.dormantId,
                        ),

                    previousGroupName:
                        "휴면",

                    currentGroupId:
                        String(groupId),

                    currentGroupName:
                        groupName,

                    isRead:
                        false,

                    assignedAt:
                        new Date(),
                },
            },
        },
    )
}
// 주간 사용자 랭킹을 위한 함수
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

export async function updateUserGroups(
    updates,
) {
    if (updates.length === 0) {
        return null
    }

    const operations =
        updates.map((update) => ({
            updateOne: {
                filter: {
                    _id: update.userId,
                },

                update: {
                    $set: {
                        groupId:
                            update.groupId,

                        weeklyGroupNotice:
                            update.weeklyGroupNotice,
                    },
                },
            },
        }))

    return User.bulkWrite(
        operations,
    )
}
// 한번만 읽히는 알람
// 알림을 한 번만 조회하고 읽음 처리
export async function consumeWeeklyGroupNotice(
    userId,
) {
    return User.findOneAndUpdate(
        {
            _id: userId,

            // 아직 읽지 않은 알림만 조회
            "weeklyGroupNotice.isRead":
                false,

            // 정상적인 알림 상태만 조회
            "weeklyGroupNotice.status": {
                $in: [
                    "UP",
                    "SAME",
                    "DOWN",
                    "RETURN",
                    "NEW",
                ],
            },

            $or: [
                /*
                 * 신규가입 알림은
                 * weekStart가 없어도 조회
                 */
                {
                    "weeklyGroupNotice.status":
                        "NEW",

                    "weeklyGroupNotice.currentGroupId": {
                        $nin: [
                            "",
                            null,
                        ],
                    },
                },

                /*
                 * 주간 그룹 알림은
                 * weekStart가 있어야 조회
                 */
                {
                    "weeklyGroupNotice.weekStart": {
                        $nin: [
                            "",
                            null,
                        ],
                    },
                },
            ],
        },
        {
            $set: {
                "weeklyGroupNotice.isRead":
                    true,
            },
        },
        {
            /*
             * 읽음 처리하기 전 데이터를 반환
             * 프론트에서는 isRead:false 상태를 받음
             */
            new: false,
        },
    )
        .select("weeklyGroupNotice")
        .lean()
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
        groupId,
        // 탈퇴 회원이 그룹 통계에 포함되지 않도록 제외
        useYn: "Y"
    }).select(
        "_id nickname profileImg groupId currentStreak",
    );
}

//사용자 삭제 - 사용안함
export const deleteUserById = async (userId) => {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new Error("존재하지 않는 사용자입니다.");
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
    // 현재 이용 중인 사용자 조회
    const user = await User.findOne({
        _id: userId,
        useYn: "Y"
    })

    if (!user) {
        return null
    }

    // 탈퇴 전 아이디, 이메일 보관
    const originalUserId = user.userId
    const originalEmail = user.email
    const uniqueSuffix = user._id.toString()

    user.withdrawnUserId = originalUserId
    user.withdrawnEmail = originalEmail

    // 기존 아이디 변경 | 동일 아이디 재가입할 수 있도록 unique 인덱스 비움
    user.userId = `withdrawn_${originalUserId}_${uniqueSuffix}`

    // 기존 이메일 변경 | 동일 이메일 재가입할 수 있도록 unique 인덱스 비움
    const atIndex = originalEmail.lastIndexOf("@")
    // 정상적인 이메일 형식인 경우
    if (atIndex !== -1) {
        // 이메일의 아이디(local)와 도메인(domain) 분리
        const emailLocal = originalEmail.slice(0, atIndex)
        const emailDomain = originalEmail.slice(atIndex + 1)

        // 이메일 형식을 유지하면서 중복되지 않는 값으로 변경
        user.email = `${emailLocal}+withdrawn_${uniqueSuffix}@${emailDomain}`
    } else {
        // 기존 이메일 형식이 비정상인 경우 방어 처리
        user.email = `withdrawn_${uniqueSuffix}@withdrawn.local`
    }

    // 탈퇴 정보 저장
    user.useYn = "N"
    user.withdrawalReason = withdrawalReason
    user.withdrawnAt = new Date()
    user.totalStudyTime = totalStudyTime
    user.groupId = null

    // googleId는 unique + sparse 인덱스이므로 null을 저장하지 않고 필드를 제거
    // null을 저장하면 일반/Google 회원 탈퇴 시 기존 null 값과 중복될 수 있음
    user.googleId = undefined

    // 연속 학습 정보 초기화
    user.currentStreak = 0
    user.maxStreak = 0
    user.lastStudyDate = ""

    return await user.save()
}

// 그룹에 배정된 활성 일반 회원 현황
export async function findActiveUsersWithGroup() {
    return User.find({
        useYn: "Y",

        // 관리자는 그룹 인원에서 제외
        role: {
            $ne: "admin"
        },

        // 그룹이 배정된 사용자만 조회
        groupId: {
            $nin: [null, ""]
        }
    })
        .select("_id groupId")
        .lean()
}

// 과목 순서 전체 교체
export async function updateSubjectOrder(userId, subjectIds) {
    return User.findByIdAndUpdate(
        userId,
        {
            // 기존 순서를 전달받은 배열로 교체
            $set: {
                subjectOrder: subjectIds
            }
        },
        {
            // 수정 완료된 User 문서를 반환
            new: true,
            // 최대 5개 검증 실행
            runValidators: true
        }
    )
}

// 새 과목 ID 순서 배열 마지막 추가 : 동일 과목 ID 중복 저장 x
export async function addSubjectToOrder(userId, subjectId) {
    return User.findByIdAndUpdate(
        userId,
        {
            // push로 사용하면 동일 과목 ID 중복될 수 있어서 addToset 사용함
            $addToSet: { subjectOrder: subjectId }
        },
        {
            new: true,
            runValidators: true
        }
    )
}

// 삭제된 과목 ID 순서배열에서 제거
export async function removeSubjectFromOrder(userId, subjectId) {
    return User.findByIdAndUpdate(
        userId,
        {
            $pull: {
                subjectOrder: subjectId
            }
        },
        {
            new: true,
            runValidators: true
        }
    )
}
