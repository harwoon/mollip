import mongoose from 'mongoose'

const adminLogSchema = new mongoose.Schema({
    type: { type: String, enum: ['SIGNUP', 'WITHDRAW'], required: true }, //가입 혹은 탈퇴
    userId: { type: String, required: true },
    message: { type: String, required: true }, // 00님이 서비스에 가입했습니다.
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('AdminLog', adminLogSchema)