import Subject from "../models/Subject";

export async function findActiveSubjectByUser(userId) {
    return await Subject.find({ user: userId, useYn: 'Y'})
    
}

export async function  createSubject(subjectData) {
    const newSubject = new Subject(subjectData)
    return await newSubject.save()
}