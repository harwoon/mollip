import { useState, useEffect } from "react"
import { FiBookOpen, FiClock } from "react-icons/fi"

import { getUsersAverage } from "../api/user"
import SummaryCard from "../../home/components/SummaryCard.jsx"

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
            <SummaryCard
                icon={<FiBookOpen />}
                label="이번 주 공부한 회원"
                value={user}
                unit="명"
            />

            <SummaryCard
                icon={<FiClock />}
                label="이번 주 평균 공부시간"
                value={time}
                unit=""
            />
        </>
    )
}