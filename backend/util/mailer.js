// cd backend
// node util/mailer.js


import nodemailer from "nodemailer"

// SMTP 메일 전송기 생성
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === "true",

    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
})

// SMTP 연결 테스트
export async function verifyMailer() {
    await transporter.verify()
}

export default transporter