import mongoose from "mongoose"

const scheduleSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },

        startDate: {
            type: String,
            required: true,
        },
        endDate: {
            type: String,
            required: true,
        },

        startTime: {
            type: String,
            default: "",
        },
        endTime: {
            type: String,
            default: "",
        },
        allDay: {
            type: Boolean,
            default: false,
        },
        memo: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        color: {
            type: String,
            default: "#be282f",
        },
    },
    {
        timestamps: true,
    }
)

scheduleSchema.index({
    user: 1,
    startDate: 1,
    endDate: 1,
})

const Schedule = mongoose.model("Schedule", scheduleSchema)

export default Schedule