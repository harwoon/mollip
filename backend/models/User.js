import mongoose from "mongoose"


const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        userPw: {
            type: String,
            required: true,
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
            type: String
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

        groupId: {
            type: String,
            default: 'Unranked',
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
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model("User", userSchema)

export default User