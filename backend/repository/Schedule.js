import Schedule from "../models/Schedule.js"

export async function findSchedulesByDateRange(
    userId,
    queryStartDate,
    queryEndDate
) {
    return Schedule.find({
        user: userId,
        startDate: {
            $lte: queryEndDate,
        },
        endDate: {
            $gte: queryStartDate,
        },
    })
        .sort({
            startDate: 1,
            startTime: 1,
        })
        .lean()
}

export async function createSchedule(
    scheduleData,
) {
    return Schedule.create(scheduleData)
}

export async function findOverlappingSchedules(
    userId,
    startDate,
    endDate,
    excludedScheduleId = null,
) {
    const query = {
        user: userId,
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
    }

    if (excludedScheduleId) {
        query._id = { $ne: excludedScheduleId }
    }

    return Schedule.find(query)
        .select("startDate endDate")
        .lean()
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
