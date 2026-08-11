import { useEffect, useState } from "react"
import { FiMail } from "react-icons/fi"
import AppModal from "../../../components/common/AppModal"
import { resendDormantVerification, verifyDormantAccount } from "../api/auth"
import styles from "./DormantVerificationModal.module.css"

export default function DormantVerificationModal({ verification, onClose, onVerified }) {
    const [code, setCode] = useState("")
    const [message, setMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [resendSeconds, setResendSeconds] = useState(30)

    useEffect(() => {
        if (!verification || resendSeconds <= 0) return
        const timer = window.setTimeout(() => setResendSeconds((value) => value - 1), 1000)
        return () => window.clearTimeout(timer)
    }, [verification, resendSeconds])

    if (!verification) return null

    const handleVerify = async () => {
        if (!/^\d{6}$/.test(code)) {
            setMessage("6자리 숫자 인증번호를 입력해 주세요.")
            return
        }
        setSubmitting(true)
        setMessage("")
        try {
            onVerified(await verifyDormantAccount(verification.verificationId, code))
        } catch (error) {
            setMessage(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleResend = async () => {
        setSubmitting(true)
        setMessage("")
        try {
            const result = await resendDormantVerification(verification.verificationId)
            setResendSeconds(30)
            setMessage(result.message)
        } catch (error) {
            setMessage(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AppModal open title="휴면 계정 안내" description="장기간 학습 기록이 없어 계정이 휴면 상태로 전환되었습니다." icon={<FiMail />} onClose={onClose} closeOnOverlay={false}
            footer={<><button type="button" className="app-btn-secondary" onClick={onClose}>취소</button><button type="button" className="app-btn-primary" onClick={handleVerify} disabled={submitting}>인증하기</button></>}>
            <div className={styles.content}>
                <p>등록된 이메일 <strong>{verification.maskedEmail}</strong>로 인증번호를 전송했습니다.</p>
                <label className="app-field">
                    <span className="app-field-label">인증번호</span>
                    <input className={`app-input ${styles.codeInput}`} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={(event) => event.key === "Enter" && handleVerify()} inputMode="numeric" autoComplete="one-time-code" placeholder="6자리 숫자" autoFocus />
                </label>
                <button type="button" className="app-btn-link" onClick={handleResend} disabled={submitting || resendSeconds > 0}>{resendSeconds > 0 ? `인증번호 재전송 (${resendSeconds}초)` : "인증번호 재전송"}</button>
                {message && <p className={styles.message} role="status">{message}</p>}
            </div>
        </AppModal>
    )
}
