import { useState, useEffect } from "react"
import { getUsersCount } from "../api/user"

export function TotalUser() { 
    const [counts, setCounts] = useState({ 
        normalUserCount: 0, 
        dormantUserCount: 0 
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
            <span>전체 회원 {counts.normalUserCount}명</span>
            <span>휴면 회원 {counts.dormantUserCount}명</span>
        </>
    )
}