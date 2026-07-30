import mongoose from "mongoose"


const studySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User", // User 모델을 참조
        },
        studyTitle: {
            type: String,
            required: true,
        },
        studyDate: {
            type: String,
            required: true,
        },
        // startTime: {
        //     type: Date,
        //     required: true,
        // },
        // endTime: {
        //     type: Date,
        //     required: true,
        // },
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