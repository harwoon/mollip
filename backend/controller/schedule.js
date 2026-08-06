import * as scheduleRepository from "../repository/schedule.js"

// 일정 등록
export async function addSchedule(req, res) {
    try {
        const userId = req.user?._id

        if (!userId) {
            return res.status(401).json({
                message: "로그인이 필요합니다.",
            })
        }

        const {
            title,
            startDate,
            endDate,
            startTime = "",
            endTime = "",
            allDay = false,
            memo = "",
            color = "#7c83fd",
        } = req.body

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "일정 제목을 입력해주세요.",
            })
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "일정 시작일과 종료일을 모두 입력해주세요.",
            })
        }

        if (startDate > endDate) {
            return res.status(400).json({
                message: "종료일은 시작일보다 빠를 수 없습니다.",
            })
        }

        if (
            !allDay &&
            startTime &&
            endTime &&
            startTime >= endTime
        ) {
            return res.status(400).json({
                message:
                    "종료 시간은 시작 시간보다 늦어야 합니다.",
            })
        }

        const scheduleData = {
            user: userId,
            title: title.trim(),
            startDate,
            endDate,

            // 종일 일정이면 시간은 저장하지 않음
            startTime: allDay ? "" : startTime,
            endTime: allDay ? "" : endTime,

            allDay: Boolean(allDay),
            memo: memo.trim(),
            color,
        }

        const schedule =
            await scheduleRepository.createSchedule(
                scheduleData,
            )

        return res.status(201).json({
            message: "일정이 등록되었습니다.",
            schedule,
        })
    } catch (error) {
        console.error("일정 등록 실패:", error)

        return res.status(500).json({
            message: "일정 등록 중 오류가 발생했습니다.",
        })
    }
}

export async function getSchedules(req, res) {
    try {
        const userId = req.user?._id

        if (!userId) {
            return res.status(401).json({
                message: "로그인이 필요합니다.",
            })
        }

        const { startDate, endDate } =
            req.query

        if (!startDate || !endDate) {
            return res.status(400).json({
                message:
                    "조회 시작일과 종료일이 필요합니다.",
            })
        }

        const schedules =
            await scheduleRepository
                .findSchedulesByDateRange(
                    userId,
                    startDate,
                    endDate,
                )

        return res.status(200).json({
            schedules,
        })
    } catch (error) {
        console.error("일정 조회 실패:", error)

        return res.status(500).json({
            message:
                "일정 조회 중 오류가 발생했습니다.",
        })
    }
}

// 일정 수정
export async function updateSchedule(req, res) {
    try {
        const userId = req.user?._id
        const { scheduleId } = req.params

        if (!userId) {
            return res.status(401).json({
                message: "로그인이 필요합니다.",
            })
        }

        const {
            title,
            startDate,
            endDate,
            startTime = "",
            endTime = "",
            allDay = false,
            memo = "",
            color = "#7c83fd",
        } = req.body

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "일정 제목을 입력해주세요.",
            })
        }

        if (!scheduleDate) {
            return res.status(400).json({
                message: "일정 시작일과 종료일을 모두 입력해주세요.",
            })
        }

        if (startDate > endDate) {
            return res.status(400).json({
                message: "종료일은 시작일보다 빠를 수 없습니다.",
            })
        }

        if (
            !allDay &&
            startTime &&
            endTime &&
            startTime >= endTime
        ) {
            return res.status(400).json({
                message:
                    "종료 시간은 시작 시간보다 늦어야 합니다.",
            })
        }

        const updateData = {
            title: title.trim(),
            startDate,
            endDate,
            startTime: allDay ? "" : startTime,
            endTime: allDay ? "" : endTime,
            allDay: Boolean(allDay),
            memo:
                typeof memo === "string"
                    ? memo.trim()
                    : "",
            color,
        }

        const schedule =
            await scheduleRepository.updateSchedule(
                userId,
                scheduleId,
                updateData,
            )

        if (!schedule) {
            return res.status(404).json({
                message: "일정을 찾을 수 없습니다.",
            })
        }

        return res.status(200).json({
            message: "일정이 수정되었습니다.",
            schedule,
        })
    } catch (error) {
        console.error("일정 수정 실패:", error)

        return res.status(500).json({
            message:
                "일정 수정 중 오류가 발생했습니다.",
        })
    }
}


// 일정 삭제
export async function deleteSchedule(req, res) {
    try {
        const userId = req.user?._id
        const { scheduleId } = req.params

        if (!userId) {
            return res.status(401).json({
                message: "로그인이 필요합니다.",
            })
        }

        const schedule =
            await scheduleRepository.deleteSchedule(
                userId,
                scheduleId,
            )

        if (!schedule) {
            return res.status(404).json({
                message: "일정을 찾을 수 없습니다.",
            })
        }

        return res.status(200).json({
            message: "일정이 삭제되었습니다.",
            scheduleId: schedule._id,
        })
    } catch (error) {
        console.error("일정 삭제 실패:", error)

        return res.status(500).json({
            message:
                "일정 삭제 중 오류가 발생했습니다.",
        })
    }
}