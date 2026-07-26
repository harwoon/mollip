import Subject from "../models/Subject.js";

export async function findActiveSubjectsByUser(userId) {
    return await Subject.find({ user: userId, useYn: 'Y' })
}

export async function createSubject(subjectData) {
    const newSubject = new Subject(subjectData)
    return await newSubject.save()
}