import Study from "../models/Study.js"

export async function createStudy(studyData) {
    const study = new Study(studyData)
    const savedStudy = await study.save()
    return savedStudy.toObject()
}

// 일간 기록 가져오기
export async function getDailyByUserIdAndDate(user, date, sortOption = {}, limitOption = 0) {
    return Study.find({ 
        user, 
        studyDate: date 
    })
    .sort(sortOption)
    .limit(limitOption)
    // 원하는 속성만 리턴할 경우
    // return Study.find({user,studyDate:date}).select("studyTitle studyDate sumStudyTime -_id")
}

// 주간 기록 가져오기
export async function getWeeklyByUserIdAndDate(user, startDate, endDate, sortOption = {}, limitOption = 0) {
    return Study.find({
        user,
        studyDate: {
            $gte: startDate,
            $lte: endDate
        }
    })
    .sort(sortOption)
    .limit(limitOption)
}

// 월간 기록 가져오기
export async function getMonthlyByUserIdAndDate(user, month, sortOption = {}, limitOption = 0) {
    return Study.find({ 
        user, 
        studyDate: { $regex: `^${month}` } 
    })
    .sort(sortOption)
    .limit(limitOption)
}

// 일간 과목 기록 가져오기
export async function getDailyByUserIdAndSubjectAndDate(user, subject,date) {
    return Study.find({ 
        user,
        studyTitle:subject, 
        studyDate: date 
    })
}

// 주간 과목 기록 가져오기
export async function getWeeklyByUserIdAndSubjectAndDate(user, subject, startDate, endDate) {
    return Study.find({
        user,
        studyTitle: subject,
        studyDate: {
            $gte: startDate,
            $lte: endDate
        }
    })
}

// 월간 과목 기록 가져오기
export async function getMonthlyByUserIdAndSubjectAndDate(user,subject, month) {
    return Study.find({ 
        user, 
        subjectTitle:subject,
        studyDate: { $regex: `^${month}` } 
    })
}

// 유저 전체 누적 학습 기록 가져오기 (합산용) - 관리자
export async function getAllByUserId(user) {
    return Study.find({ user })
}

export async function getWeeklyStudyTimeByUSers(
    startOfWeek,
    endOfWeek
) {
    return Study.aggregate([
        {
            $match: {
                studyDate: {
                    $gte: startOfWeek,
                    $lte: endOfWeek,
                },
            },
        },
        {
            $group: {
                _id:"$user",
                totalStudyTime: {
                    $sum:"$sumStudyTime",
                },
            },
        },
    ])
}

export async function getWeeklyGroupTop3(
    groupId,
    weekStart,
    weekEnd
) {
    return Study.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: weekStart,
                    $lt: weekEnd,
                },
            },
        },
        {
            $group: {
                _id: "$user",
                totalStudyTime: {
                    $sum: "$studyTime",
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo",
            },
        },
        {
            $unwind: "$userInfo",
        },
        {
            $match: {
                "userInfo.groupId": groupId,
            },
        },
        {
            $sort: {
                totalStudyTime: -1,
                _id: 1,
            },
        },
        {
            $limit: 3,
        },
        {
            $project: {
                _id: 0,
                userId: "$_id",
                name: "$userInfo.nickname",
                image: "$userInfo.profileImg",
                totalStudyTime: 1,
            },
        },
    ])
}