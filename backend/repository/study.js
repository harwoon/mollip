import Study from "../models/Study.js"

export async function createStudy(studyData) {
    const study = new Study(studyData)
    const savedStudy = await study.save()
    return savedStudy._id.toString()
}