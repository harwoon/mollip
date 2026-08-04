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
        <div>
            {data.map((subject, index) => {
                const ratio = Math.round(subject.ratio)
                const hours = (subject.sumStudyTime / 3600).toFixed(1)

                return (
                    <div key={index} >
                        <div/>
                        
                        <span>
                            {subject.studyTitle}
                        </span>
                        
                        <span>
                            {ratio}%
                        </span>
                        
                        <span>
                            ({hours}시간)
                        </span>
                    </div>
                )
            })}
        </div>
    )
}