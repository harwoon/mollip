import Study from "../models/Study.js"

export async function createStudy(studyData) {
    const study = new Study(studyData)
    const savedStudy = await study.save()
    return savedStudy.toObject()
}

export async function getDailyByUserIdAndDate(user, date) {
    return Study.find({ user, studyDate: date })
}