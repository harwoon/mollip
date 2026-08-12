import * as scheduleRepository from "../repository/schedule.js"
import dayjs from "dayjs"

import {
    MAX_SCHEDULES_PER_DAY,
    SCHEDULE_COLORS,
} from "../constants/schedule.js"

function findFullScheduleDate(schedules, startDate, endDate) {
    const events = new Map()

    schedules.forEach((schedule) => {
        const overlapStart = schedule.startDate > startDate
            ? schedule.startDate
            : startDate
        const overlapEnd = schedule.endDate < endDate
            ? schedule.endDate
            : endDate
        const afterOverlapEnd = dayjs(overlapEnd)
            .add(1, "day")
            .format("YYYY-MM-DD")

        events.set(overlapStart, (events.get(overlapStart) || 0) + 1)
        events.set(afterOverlapEnd, (events.get(afterOverlapEnd) || 0) - 1)
    })

    let activeScheduleCount = 0
    const sortedEvents = [...events.entries()]
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))

    for (const [date, change] of sortedEvents) {
        if (date > endDate) break

        activeScheduleCount += change
        if (date >= startDate && activeScheduleCount >= MAX_SCHEDULES_PER_DAY) {
            return date
        }
    }

    return null
}

async function validateScheduleAvailability({
    userId,
    scheduleId = null,
    startDate,
    endDate,
    color,
}) {
    if (!SCHEDULE_COLORS.includes(color)) {
        return {
            status: 400,
            message: "사용할 수 없는 일정 색상입니다.",
        }
    }

    const overlappingSchedules = await scheduleRepository.findOverlappingSchedules(
        userId,
        startDate,
        endDate,
        scheduleId,
    )

    const fullScheduleDate = findFullScheduleDate(
        overlappingSchedules,
        startDate,
        endDate,
    )

    if (fullScheduleDate) {
        return {
            status: 409,
            message: `${fullScheduleDate}에는 이미 일정이 7개 등록되어 있습니다.`,
        }
    }

    return null
}

// 일정 등록
export async function addSchedule(req, res) {
    try {
        const userId = req.user?._id

        if (!userId) {
            return res.status(401).json({ message: "로그인이 필요합니다." })
        }

        const {
            title, startDate, endDate, startTime = "", endTime = "",
            allDay = false, memo = "", color = SCHEDULE_COLORS[0],
        } = req.body

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "일정 제목을 입력해주세요." })
        }

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "일정 시작일과 종료일을 모두 입력해주세요." })
        }

        if (startDate > endDate) {
            return res.status(400).json({ message: "종료일은 시작일보다 빠를 수 없습니다." })
        }

        if (!allDay && startDate === endDate && startTime && endTime && startTime >= endTime) {
            return res.status(400).json({ message: "같은 날짜일 경우 종료 시간은 시작 시간보다 늦어야 합니다." })
        }

        const availabilityError = await validateScheduleAvailability({
            userId,
            startDate,
            endDate,
            color,
        })

        if (availabilityError) {
            return res
                .status(availabilityError.status)
                .json({ message: availabilityError.message })
        }

        const scheduleData = {
            user: userId,
            title: title.trim(),
            startDate,
            endDate,
            startTime: allDay ? "" : startTime,
            endTime: allDay ? "" : endTime,
            allDay: Boolean(allDay),
            memo: memo.trim(),
            color,
        }

        const schedule = await scheduleRepository.createSchedule(scheduleData)

        return res.status(201).json({ message: "일정이 등록되었습니다.", schedule })
    } catch (error) {
        console.error("일정 등록 실패:", error)
        return res.status(500).json({ message: "일정 등록 중 오류가 발생했습니다." })
    }
}

// 일정 조회
export async function getSchedules(req, res) {
    try {
        const userId = req.user?._id

        if (!userId) {
            return res.status(401).json({ message: "로그인이 필요합니다." })
        }

        const { startDate, endDate } = req.query

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "조회 시작일과 종료일이 필요합니다." })
        }

        const schedules = await scheduleRepository.findSchedulesByDateRange(userId, startDate, endDate)

        return res.status(200).json({ schedules })
    } catch (error) {
        console.error("일정 조회 실패:", error)
        return res.status(500).json({ message: "일정 조회 중 오류가 발생했습니다." })
    }
}

// 일정 수정
export async function updateSchedule(req, res) {
    try {
        const userId = req.user?._id
        const { scheduleId } = req.params

        if (!userId) {
            return res.status(401).json({ message: "로그인이 필요합니다." })
        }

        const {
            title, startDate, endDate, startTime = "", endTime = "",
            allDay = false, memo = "", color = SCHEDULE_COLORS[0],
        } = req.body

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "일정 제목을 입력해주세요." })
        }

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "일정 시작일과 종료일을 모두 입력해주세요." })
        }

        if (startDate > endDate) {
            return res.status(400).json({ message: "종료일은 시작일보다 빠를 수 없습니다." })
        }

        if (!allDay && startDate === endDate && startTime && endTime && startTime >= endTime) {
            return res.status(400).json({ message: "같은 날짜일 경우 종료 시간은 시작 시간보다 늦어야 합니다." })
        }

        const availabilityError = await validateScheduleAvailability({
            userId,
            scheduleId,
            startDate,
            endDate,
            color,
        })

        if (availabilityError) {
            return res
                .status(availabilityError.status)
                .json({ message: availabilityError.message })
        }

        const updateData = {
            title: title.trim(),
            startDate,
            endDate,
            startTime: allDay ? "" : startTime,
            endTime: allDay ? "" : endTime,
            allDay: Boolean(allDay),
            memo: typeof memo === "string" ? memo.trim() : "",
            color,
        }

        const schedule = await scheduleRepository.updateSchedule(userId, scheduleId, updateData)

        if (!schedule) {
            return res.status(404).json({ message: "일정을 찾을 수 없습니다." })
        }

        return res.status(200).json({ message: "일정이 수정되었습니다.", schedule })
    } catch (error) {
        console.error("일정 수정 실패:", error)
        return res.status(500).json({ message: "일정 수정 중 오류가 발생했습니다." })
    }
}

// 일정 삭제
export async function deleteSchedule(req, res) {
    try {
        const userId = req.user?._id
        const { scheduleId } = req.params

        if (!userId) {
            return res.status(401).json({ message: "로그인이 필요합니다." })
        }

        const schedule = await scheduleRepository.deleteSchedule(userId, scheduleId)

        if (!schedule) {
            return res.status(404).json({ message: "일정을 찾을 수 없습니다." })
        }

        return res.status(200).json({ message: "일정이 삭제되었습니다.", scheduleId: schedule._id })
    } catch (error) {
        console.error("일정 삭제 실패:", error)
        return res.status(500).json({ message: "일정 삭제 중 오류가 발생했습니다." })
    }
}
