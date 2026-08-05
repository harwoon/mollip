const API_URL = import.meta.env.VITE_LOCAL_API_URL

async function requestSchedule(
    url,
    options = {}
) {
    const token =
        localStorage.getItem("token")

    const response = await fetch(
        `${API_URL}${url}`,
        {
            ...options,
            headers: {
                "Content-Type":
                    "application/json",
                Authorization:
                    `Bearer ${token}`,
                ...options.headers,
            },
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
                "일정 요청에 실패했습니다."
        )
    }

    return data
}

export function getSchedules(
    startDate,
    endDate
) {
    const params = new URLSearchParams({
        startDate,
        endDate,
    })

    return requestSchedule(
        `/schedule?${params.toString()}`
    )
}

export function addSchedule(scheduleData) {
    return requestSchedule("/schedule", {
        method: "POST",
        body: JSON.stringify(scheduleData),
    })
}

export function updateSchedule(
    scheduleId,
    scheduleData
) {
    return requestSchedule(
        `/schedule/${scheduleId}`,
        {
            method: "PATCH",
            body: JSON.stringify(
                scheduleData
            ),
        }
    )
}

export function deleteSchedule(scheduleId) {
    return requestSchedule(
        `/schedule/${scheduleId}`,
        {
            method: "DELETE",
        }
    )
}