import Study from "../models/Study.js"

export async function createStudy(studyData) {
    const study = new Study(studyData)
    const savedStudy = await study.save()
    return savedStudy.toObject()
}

export async function getDailyByUserIdAndDate(user, date) {
    return Study.find({ 
        user, 
        studyDate: date 
    })

    // 원하는 속성만 리턴할 경우
    // return Study.find({user,studyDate:date}).select("studyTitle studyDate sumStudyTime -_id")
}

export async function getWeeklyByUserIdAndDate(user, startDate, endDate) {
    return Study.find({
        user,
        studyDate: {
            $gte: startDate,
            $lte: endDate
        }
    })
}

export async function getMonthlyByUserIdAndDate(user, month) {
    return Study.find({ 
        user, 
        studyDate: { $regex: `^${month}` } 
    })
}