import { useState, useEffect } from "react"
// import { getWeeklyReport } from "../api/ai.js"

import AiSummary from "./AiSummary.jsx"
import AiLastWeek from "./AiLastWeek.jsx"
import AiThisWeek from "./AiThisWeek.jsx"
import AiNextWeek from "./AiNextWeek.jsx"

import "./AiReportModal.css"

export default function AiReportModal({ onClose }) {
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchReport() {
            try {
                const data = await getWeeklyReport()
                setReport(data.report)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [])

    return (
        <div className="aiReportOverlay" onClick={onClose}>
            <div className="aiReportBox" onClick={(e) => e.stopPropagation()}>
                <div className="aiReportHeader">
                    <strong>AI 학습 리포트</strong>
                    <button type="button" onClick={onClose}>✕</button>
                </div>

                <div className="aiReportBody">
                    {loading && <p>리포트를 생성하는 중입니다...</p>}
                    {error && <p className="aiReportError">{error}</p>}

                    {/* 응답 형태 확정 전까지, 우선 원본 그대로 확인용 출력 */}
                    {report && (
                        <div>
                            <AiSummary  />
                            <AiLastWeek />
                            <AiThisWeek />
                            <AiNextWeek />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}