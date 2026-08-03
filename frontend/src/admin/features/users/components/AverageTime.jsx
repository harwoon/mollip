import { useState, useEffect } from "react"
import { getUsersAverage } from "../api/user"

export function AverageTime() { 
    const [user, setUser] = useState(0)
    const [time, setTime] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getUsersAverage()
                setUser(data.studyUserCount)
                setTime(data.averageWeeklyStudyTime)
            } catch (error) {
                console.error(error.message)
            }
        }

        fetchData()
    }, [])

    return (
        <>
            <span>이번 주 공부한 회원 {user}명</span>
            <span>이번 주 평균 공부시간 {time}분</span>
        </>
    )
}