import { useState, useEffect } from "react"
import Topbar from "../components/AdminTopbar.jsx"
import SummaryRow from "../features/home/components/SummaryRow.jsx"
import { getGroupCount } from "../features/home/api/group.js"
import { getUserCount } from "../features/home/api/user.js"

// 관리자 홈 페이지
export default function AdminHomePage() {
    // 임시 데이터❗
    const [summary, setSummary] = useState({
        groupCount: 0,
        groupCountDiff: "수정 필요",
        userCount: 0,
        userCountDiff: "수정 필요",
        studyingCount: 0,
        studyingCountNote: "수정 필요",
        weeklyTotalTime: "수정 필요",
        weeklyTotalTimeDiff: "수정 필요",
        avgGoalRate: 0,
        avgGoalRateDiff: "수정 필요",
    })

    useEffect(() => {
        async function fetchSummary() {
            try {
                const [groupData, userData] = await Promise.all([
                    getGroupCount(),
                    getUserCount(),
                ])

                setSummary(prev => ({
                    ...prev,
                    groupCount: groupData.count,
                    userCount: userData.count
                }))
            } catch (error) {
                console.error("데이터 조회 실패", error.message)
            }
        }

        fetchSummary()
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