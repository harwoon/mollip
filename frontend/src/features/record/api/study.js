import { API_URL } from "../../../config/apiUrl.js"
import { formatDate } from "../../../../../backend/util/date"

// 총 공부시간 가져오기
export async function getStudyRecord(type, date) {
    const token = localStorage.getItem("token")

    const targetDate = new Date(date)
    const prevDate = new Date(date)

    if (type === "daily") {
        prevDate.setDate(targetDate.getDate() - 1) // 어제
    } else if (type === "weekly") {
        prevDate.setDate(targetDate.getDate() - 7) // 일주일 전
    } else if (type === "monthly") {
        prevDate.setMonth(targetDate.getMonth() - 1) // 한 달 전
    }

    const [currentResponse, prevResponse] = await Promise.all([

        fetch(`${API_URL}/statistics/total?type=${type}&date=${date}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        }),

        fetch(`${API_URL}/statistics/total?type=${type}&date=${formatDate(prevDate)}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        })
    ])

    const currentData = await currentResponse.json()
    const prevData = await prevResponse.json()

    if (!currentResponse.ok || !prevResponse.ok) {
        throw new Error(
            currentData.message || prevData.message || "총 공부 시간을 불러오지 못했습니다."
        )
    }
    
    return {
        current: currentData,
        previous: prevData,
        diff: currentData - prevData
    }
}

// 과목별 공부 시간 가져오기
export async function getSubjectRecord(type,date){
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/statistics/ratio?type=${type}&date=${date}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || "총 과목 시간을 불러오지 못했습니다."
        )
    }
    
    return data
}

//집중 시간 가져오기
export async function getLongestRecord(type, date) {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/study/records?type=${type}&date=${date}&sort=time&limit=1`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "집중 시간을 불러오지 못했습니다.")
    }
    
    if (!data || data.length === 0) {
        return 0; 
    }

    const study = data[0]
    return study.sumStudyTime
}

// 월간 공부 기록 가져오기
export async function getMonthlyStudyRecords(date) {
    const token = localStorage.getItem("token")

    const response = await fetch(
        `${API_URL}/study/records?type=monthly&date=${date}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || "월간 공부 기록을 불러오지 못했습니다."
        )
    }

    return data
}

// 과목별 공부시간 요약
export async function getSubjectStudySummary(
    type,
    date,
) {
    const token =
        localStorage.getItem("token")

    const query =
        new URLSearchParams({
            type,
            date,
        })

    const response = await fetch(
        `${API_URL}/statistics/subject-summary?${query}`,
        {
            method: "GET",
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        },
    )

    const data =
        await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
            "과목별 공부시간을 불러오지 못했습니다.",
        )
    }

    return data
}