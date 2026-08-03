import Schedule from "../models/Schedule.js"

export async function findSchedulesByDateRange(
    userId,
    startDate,
    endDate
) {
    return Schedule.find({
        user: userId,
        scheduleDate: {
            $gte: startDate,
            $lte: endDate,
        },
    })
        .sort({
            scheduleDate: 1,
            startTime: 1,
        })
        .lean()
}

export async function createSchedule(
    scheduleData,
) {
    return Schedule.create(scheduleData)
}

export async function updateSchedule(
    userId,
    scheduleId,
    updateData
) {
    return Schedule.findOneAndUpdate(
        {
            _id: scheduleId,
            user: userId,
        },
        {
            $set: updateData,
        },
        {
            new: true,
            runValidators: true,
        }
    )
}

export async function deleteSchedule(
    userId,
    scheduleId
) {
    return Schedule.findOneAndDelete({
        _id: scheduleId,
        user: userId,
    })
}