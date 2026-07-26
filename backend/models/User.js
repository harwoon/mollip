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
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model("User", userSchema)

export default User