import { useState, useEffect } from "react"
import Topbar from "../components/AdminTopbar.jsx"
import SummaryRow from "../features/home/components/SummaryRow.jsx"
import { getGroupCount } from "../features/home/api/group.js"

// 관리자 홈 페이지
export default function AdminHomePage() {
    // 임시 데이터❗
    const [summary, setSummary] = useState({
        groupCount: 0,
        groupCountDiff: "",
        userCount: 142,
        userCountDiff: "+10명 (전주 대비)",
        studyingCount: 87,
        studyingCountNote: "전체의 62%",
        weeklyTotalTime: "1,248",
        weeklyTotalTimeDiff: "+158시간 (전주 대비)",
        avgGoalRate: 78,
        avgGoalRateDiff: "+6% UP (전주 대비)",
    })

    useEffect(() => {
        async function fetchGroupCount() {
            try {
                const data = await getGroupCount()
                setSummary(prev => ({
                    ...prev,
                    groupCount: data.count,
                }))
            } catch (error) {
                console.error("그룹 수 조회 실패:", error.message)
            }
        }

        fetchGroupCount()
    }, [])


    return (
        <div>
            <Topbar
                title="관리자 홈"
                description="Mollip 서비스 전체 운영 현황을 한눈에 확인하고, 필요한 항목을 관리하세요."
            />
            <SummaryRow summary={summary}/>
        </div>
    )
}