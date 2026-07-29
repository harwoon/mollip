import React, { useState, useEffect } from 'react'
import { getMyGroup } from "../api/group"

export default function MyGroup() {
    const [groupName, setGroupName] = useState("")
    const [groupTime, setGroupTime] = useState("")

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const data = await getMyGroup()
                
                setGroupName(data.groupName)
                setGroupTime(data.groupTime)
            } catch (error) {
                console.error("그룹 데이터 가져오기 실패:", error)
            }
        }

        fetchGroupData()
    }, [])

    return (
        <div>
            <h4>{groupName || "그룹명 로딩 중..."}</h4>
            <h4>{groupTime !== "" ? groupTime : "시간 로딩 중..."}</h4>
        </div>
    )
}