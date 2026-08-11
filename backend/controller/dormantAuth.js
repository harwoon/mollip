import {
    resendDormantCode,
    verifyDormantCode,
} from "../service/dormantVerificationService.js"

export async function verify(req, res) {
    const { verificationId, code } = req.body
    if (!verificationId || !/^\d{6}$/.test(String(code ?? ""))) {
        return res.status(400).json({ message: "verificationId와 6자리 인증번호가 필요합니다." })
    }

    try {
        const result = await verifyDormantCode(verificationId, code)
        return res.status(result.status).json(result.data || { message: result.message })
    } catch (error) {
        console.error("휴면 계정 인증 실패:", error)
        return res.status(500).json({ message: "휴면 계정 인증 중 오류가 발생했습니다." })
    }
}

export async function resend(req, res) {
    const { verificationId } = req.body
    if (!verificationId) {
        return res.status(400).json({ message: "verificationId가 필요합니다." })
    }

    try {
        const result = await resendDormantCode(verificationId)
        return res.status(result.status).json(result.data || { message: result.message })
    } catch (error) {
        console.error("휴면 계정 인증번호 재전송 실패:", error)
        return res.status(502).json({ message: "인증 메일을 전송하지 못했습니다. 잠시 후 다시 시도해 주세요." })
    }
}
