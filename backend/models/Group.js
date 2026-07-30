import mongoose from "mongoose"

const groupGoalSchema = new mongoose.Schema(
    {
        goalType: {
            type: String,
            required: true,
            enum: [
                "MIN_STUDY_TIME",
                "CHALLENGE_STUDY_TIME",
                "TODO_COMPLETION_RATE",
                "ATTENDANCE_DAYS"
            ]
        },
        targetValue: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            required: true,
            enum: [
                "HOUR",
                "PERCENT",
                "DAY"
            ]
        },
        order: {
            type: Number,
            required: true,
            min: 1,
            max: 4
        }
    },
    {
        _id: false
    }
)

const groupSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            required: true,
            unique: true
        },
        groupColor: {
            type: String,
            required: true,
            unique: true
        },
        groupTime: {
            type: Number,
            required: true,
            min: 0,
            unique: true
        },
        goals: {
            type: [groupGoalSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
)

const Group = mongoose.model("Group", groupSchema)

export default Group