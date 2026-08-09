import { useState, useEffect } from "react"
import { FiUsers, FiMoon } from "react-icons/fi"

import { getUsersCount } from "../api/user"
import SummaryCard from "../../home/components/SummaryCard.jsx"

export function TotalUser() {
    const [counts, setCounts] = useState({
        normalUserCount: 0,
        dormantUserCount: 0,
    })

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const data = await getUsersCount()
                setCounts(data)
            } catch (error) {
                console.error(error.message)
            }
        }

        fetchCounts()
    }, [])

    return (
        <>
            <SummaryCard
                icon={<FiUsers />}
                label="전체 회원"
                value={counts.normalUserCount}
                unit="명"
            />

            <SummaryCard
                icon={<FiMoon />}
                label="휴면 회원"
                value={counts.dormantUserCount}
                unit="명"
            />
        </>
    )
}