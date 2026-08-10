import mongoose from "mongoose"


const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true
        },
        userPw: {
            type: String,

            required: function () {
                return (
                    this.authProvider ===
                    "local"
                )
            },
        },
        nickname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        profileImg: {
            type: String,
            default: "/images/noprofile.png"
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

        groupId: {
            type: String,
            default: '6a6c309cb5f65e32d4078d00',
        },

        weeklyGroupNotice: {
            // 알림 종류
            status: {
                type: String,
                enum: [
                    "UP",
                    "SAME",
                    "DOWN",
                    "RETURN",
                    "NEW",
                ],
                default: "SAME",
            },

            // 이전 그룹 정보
            previousGroupId: {
                type: String,
                default: "",
            },

            previousGroupName: {
                type: String,
                default: "",
            },

            // 새로 배정된 그룹 정보
            currentGroupId: {
                type: String,
                default: "",
            },

            currentGroupName: {
                type: String,
                default: "",
            },

            // 어느 주의 그룹 배정 알림인지
            weekStart: {
                type: String,
                default: "",
            },

            // 알림 확인 여부
            isRead: {
                type: Boolean,
                default: true,
            },

            assignedAt: {
                type: Date,
                default: null,
            },
        },

        lastStudyDate: {
            type: String,
            default: ""
        },

        currentStreak: {
            type: Number,
            default: 0
        },

        maxStreak: {
            type: Number,
            default: 0
        },

        // 이용중, 탈퇴
        useYn: {
            type: String,
            enum: ["Y", "N"],
            default: "Y"
        },

        // 탈퇴 전 아이디 - 탈퇴시 보관용
        withdrawnUserId: {
            type: String,
            default: null
        },

        // 탈퇴 전 이메일 - 탈퇴시 보관용
        withdrawnEmail: {
            type: String,
            default: null
        },

        // 탈퇴사유
        withdrawalReason: {
            type: String,
            default: ""
        },

        // 탈퇴일
        withdrawnAt: {
            type: Date,
            default: null
        },

        // 탈퇴직전 누적공부시간
        totalStudyTime: {
            type: Number,
            default: 0
        },
        authProvider: {
            type: String,
            enum: [
                "local",
                "google",
            ],
            default: "local",
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        // 사용자 설정 과목 순서
        // Subject 문서의 ObjectId만 순서대로 저장(과목은 subject 컬렉션이고 순서만 저장함)
        subjectOrder: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Subject"
                }
            ],

            // 과목을 등록하지 않은 사용자 = 빈 배열
            default: [],

            //배열 5개를 초과 저장 X 검증
            validate: {
                validator(subjectIds) {
                    return subjectIds.length <= 5
                },
                message: "과목 순서는 최대 5개까지만 저장할 수 있습니다."
            }
        }
    },
    {
        timestamps: true
    }
)

// 그룹별 활성 사용자 조회용 인덱스
userSchema.index({
    groupId: 1,
    useYn: 1,
})

const User = mongoose.model(
    "User",
    userSchema,
)

export default User