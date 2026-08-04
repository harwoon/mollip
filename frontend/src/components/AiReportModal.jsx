import { useState, useEffect, useRef } from "react"
import { getWeeklyReport } from "../features/ai/api/ai.js"

import AiSummary from "../features/ai/components/AiSummary.jsx";
import AiLastWeek from "../features/ai/components/AiLastWeek.jsx";
import AiThisWeek from "../features/ai/components/AiThisWeek.jsx";
import AiNextWeek from "../features/ai/components/AiNextWeek.jsx";

import "./AiReportModal.css"

export default function AiReportModal({ onClose, onAddTodo }) {
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isFetched = useRef(false)

    const fetchReport = async () => {
        if (loading) return

        setLoading(true)
        setError("")

        try {
            const data = await getWeeklyReport()
            setReport(data.report)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isFetched.current) return; 
        isFetched.current = true; 
        
        fetchReport()
    }, [])

    return (
        <div className="aiReportOverlay" onClick={onClose}>
            <div className="aiReportBox" onClick={(e) => e.stopPropagation()}>
                <div className="aiReportHeader">
                    <strong>AI 학습 리포트</strong>
                    
                    <div className="headerButtons">
                        <button 
                            type="button" 
                            onClick={fetchReport} 
                            disabled={loading}
                        >
                            {loading ? "분석 중..." : ""}
                        </button>
                        <button type="button" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="aiReportBody">
                    {loading && <p>리포트를 생성하는 중입니다...</p>}
                    {error && <p className="aiReportError">{error}</p>}

                    {!loading && report && (
                        <div>
                            <AiSummary diagnosis={report.diagnosis} />
                            <AiLastWeek patterns={report.patterns} />
                            <AiThisWeek recommendations={report.recommendations} onAddTodo={onAddTodo} />
                            <AiNextWeek expectedChanges={report.expectedChanges} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}