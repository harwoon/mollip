import mongoose from "mongoose"


const studySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        studyTitle: {
            type: String,
            required: true,
        },
        studyDate: {
            type: String,
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        sumStudyTime: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true
    }
)

const Study = mongoose.model("Study", studySchema)

export default Study