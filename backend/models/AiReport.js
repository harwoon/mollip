import mongoose from "mongoose"

const aiReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // 리포트가 속한 날짜 ("YYYY-MM-DD", KST 기준)
    reportDate: { type: String, required: true },

    // 이번 리포트 구간(직전 리포트 이후 ~ 생성 시점)의 공부 시간(초)
    segmentStudySeconds: { type: Number, required: true },

    // AI가 반환한 JSON 저장
    reportData: { type: Object, required: true }
}, {
    timestamps: true
})

// 하루 중 가장 최근 리포트를 빠르게 조회하기 위한 인덱스
aiReportSchema.index({ user: 1, reportDate: 1, createdAt: -1 })

export default mongoose.model("AiReport", aiReportSchema)
