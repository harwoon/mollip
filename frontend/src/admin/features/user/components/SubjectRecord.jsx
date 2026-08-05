import React, { useState, useEffect } from "react"
import { getSubjectRecord } from "../api/user.js"

export default function SubjectRecord({ type, start, end, userId }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSubjectData = async () => {
            setLoading(true)
            try {
                const record = await getSubjectRecord(type, start, end, userId)
                setData(record.data || [])
                console.log(record.data)

            } catch (error) {
                console.error("과목 공부 조회 실패:", error)
                setData([])
            } finally {
                setLoading(false)
            }
        }

        fetchSubjectData()
    }, [type, start, end, userId])

    if (loading) {
        return <div style={{ padding: "20px 0", color: "#666" }}>데이터를 불러오는 중입니다...</div>
    }

    if (data.length === 0) {
        return <div style={{ padding: "20px 0", color: "#666" }}>해당 기간의 과목별 공부 기록이 없습니다.</div>
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
            {data.map((item, index) => {
                const ratio = Math.round(item.ratio)

                return (
                    <div key={index} style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                        <div style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: item.subjectColor || "#ccc", // 색상이 없을 때 기본값(회색) 처리
                            borderRadius: "2px",
                            marginRight: "12px"
                        }} />

                        {/* 과목명 */}
                        <span style={{ width: "120px", fontWeight: "500", color: "#333" }}>
                            {item.subject}
                        </span>

                        {/* 비율 (%) */}
                        <span style={{ width: "40px", textAlign: "right", marginRight: "8px", color: "#555" }}>
                            {ratio}%
                        </span>

                        {/* 공부 시간 */}
                        <span style={{ color: "#888" }}>
                            ({item.studyTime}분)
                        </span>
                    </div>
                )
            })}
        </div>
    )
}