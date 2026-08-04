import mongoose from "mongoose"

const aiReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },

    // AI가 반환한 JSON 저장
    reportData: { type: Object, required: true }
}, {
    timestamps: true
})

export default mongoose.model("AiReport", aiReportSchema)