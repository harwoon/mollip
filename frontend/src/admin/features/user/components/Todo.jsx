import React, { useState, useEffect } from "react"
// API 함수 경로에 맞게 임포트 해주세요.
import { getTodoRecords } from "../api/user.js"

export default function TodoAchievementRecord({ type, date, userId }) {
    const [record, setRecord] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchTodoData = async () => {
            setLoading(true)
            setError("")
            try {
                // 부모 컴포넌트(모달)에서 넘어온 값들로 API 호출
                const data = await getTodoRecords(type, date, userId)
                setRecord(data);
            } catch (err) {
                console.error("Todo 기록 조회 실패:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        };

        if (date && type) {
            fetchTodoData()
        }
    }, [type, date, userId])

    // 방어 로직 1: 로딩 중
    if (loading) {
        return <div style={{ padding: "20px 0", color: "#666" }}>달성률을 불러오는 중입니다...</div>;
    }

    // 방어 로직 2: 에러 발생
    if (error) {
        return <div style={{ padding: "20px 0", color: "red" }}>{error}</div>;
    }

    // 방어 로직 3: 데이터 없음
    if (!record) {
        return <div style={{ padding: "20px 0", color: "#666" }}>해당 기간의 Todo 데이터가 없습니다.</div>;
    }

    // API 응답에서 필요한 데이터 추출
    const { achievementRate, totalCount, completedCount } = record;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 0" }}>
            {/* 상단 텍스트 영역 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <strong style={{ fontSize: "16px", color: "#333" }}>목표 달성률</strong>
                <span style={{ fontSize: "14px", color: "#666" }}>
                    완료 {completedCount}개 / 전체 {totalCount}개
                </span>
            </div>

            {/* 막대그래프(프로그레스 바) 영역 */}
            <div 
                style={{ 
                    width: "100%", 
                    height: "24px", 
                    backgroundColor: "#E0E0E0", // 배경 회색 막대
                    borderRadius: "12px", 
                    overflow: "hidden", 
                    position: "relative" 
                }}
            >
                {/* 실제 달성률을 나타내는 색상 막대 */}
                <div
                    style={{
                        height: "100%",
                        width: `${achievementRate}%`,
                        backgroundColor: "#7E57C2", // 메인 테마 색상 (보라색)
                        transition: "width 0.5s ease-in-out" // 게이지가 차오르는 애니메이션
                    }}
                />
                
                {/* 막대 정중앙에 % 텍스트 표시 */}
                <div 
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        // 게이지가 50% 이상 차면 글씨를 흰색으로, 미만이면 어두운 색으로 변경하여 가독성 확보
                        color: achievementRate > 50 ? "#ffffff" : "#333333",
                        fontSize: "12px",
                        fontWeight: "bold"
                    }}
                >
                    {achievementRate}%
                </div>
            </div>
        </div>
    )
}