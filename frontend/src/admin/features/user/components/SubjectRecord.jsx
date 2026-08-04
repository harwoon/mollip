import React, { useState, useEffect } from "react"
import { getSubjectRecord } from "../../../../features/record/api/study.js"

export default function SubjectRecord({type,date}){
    const [data, setData] = useState([])

    useEffect(()=>{
        const fetchSubjectData = async () => {
            try {
                const record = await getSubjectRecord(type,date)
                setData(record.subjects || [])
                
            } catch (error) {
                console.error("과목 공부 조회 실패:", error)
            }
        }

        fetchSubjectData()
    },[type,date])

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px" }}>
            {data.map((subject, index) => {
                const ratio = Math.round(subject.ratio)
                const hours = (subject.sumStudyTime / 3600).toFixed(1)

                return (
                    <div 
                        key={index} 
                        style={{ display: "flex", alignItems: "center", fontSize: "14px" }}
                    >
                        <div
                            style={{
                                width: "12px",
                                height: "12px",
                                backgroundColor: subject.subjectColor,
                                borderRadius: "2px",
                                marginRight: "12px"
                            }}
                        />
                        
                        <span style={{ width: "120px", fontWeight: "500", color: "#333" }}>
                            {subject.studyTitle}
                        </span>
                        
                        <span style={{ width: "40px", textAlign: "right", marginRight: "8px", color: "#555" }}>
                            {ratio}%
                        </span>
                        
                        <span style={{ color: "#888" }}>
                            ({hours}시간)
                        </span>
                    </div>
                )
            })}
        </div>
    )
}