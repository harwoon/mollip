import Subject from "../models/Subject.js";

// 유저의 모든 과목 가져오기
export async function findSubjectsByUser(userId) {
    return await Subject.find({ user: userId })
}

// 유저의 과목 가져오기
export async function findBySubjectId(subjectId) {
    return await Subject.findById(subjectId);
}

// 유저의 현재 과목 가져오기
export async function findActiveSubjectsByUser(userId) {
    return await Subject.find({ user: userId, useYn: 'Y' })
}

// 유저의 아이디, 과목명으로 과목 색 가져오기
export async function findColorByUserAndTitle(userId, subjectTitle) {
    return await Subject.find({ user: userId, subjectTitle }).select("subjectColor")

}

// 과목 생성하기
export async function createSubject(subjectData) {
    const newSubject = new Subject(subjectData)
    return await newSubject.save()
}

// 과목 수정하기
export async function updateSubject(id, subjectName, subjectColor) {
    return await Subject.findByIdAndUpdate(
        id,
        { subjectName, subjectColor },
        { new: true }
    )
}

// 과목 삭제하기
export async function deleteSubject(id) {
    return await Subject.findByIdAndUpdate(
        id,
        { useYn: 'N' },
        { new: true }
    )
}