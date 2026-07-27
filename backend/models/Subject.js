import mongoose from "mongoose"

const subjectSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        subjectName: {
            type: String,
            required: true,
        },
        subjectColor: {
            type: String,
            required: true,
        },
        useYn: {
            type: String,
            enum: ['Y', 'N'],
            default: 'Y',
        }
    },
    {
        timestamps: true
    }
)

const Subject = mongoose.model("Subject", subjectSchema)

export default Subject