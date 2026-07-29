import Group from "../models/Group.js"

// 그룹 전체 목록 조회
export async function findAllGroups() {
    return Group.find().sort({ createdAt: -1 })
}

// 그룹 생성
export async function createGroup(groupData) {
    return Group.create(groupData)
}

// 그룹 색상 중복 체크 (생성용)
export async function findByGroupName(groupName) {
    return Group.findOne({
        groupName,
    })
}


export async function findByColor(groupColor) {
    return Group.findOne({
        groupColor
    })
}


export async function findByGroupTime(groupTime) {
    return Group.findOne({
        groupTime,
    })
}


export async function findGroupByStudyTime(weeklyStudyTime) {
    return Group.findOne({
        groupTime: {
            $lte: weeklyStudyTime,
        },
    }).sort({
        groupTime: -1,
    })
}

export async function getGroupsByTimeDesc() {
    return Group.find().sort({
        groupTime: -1,
    })
}

// 그룹 수정
export async function updateGroupById(id, updateData) {
    return Group.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    })
}

// 그룹 존재 확인 (수정 전 존재 확인용)
export async function findById(id) {
    return Group.findById(id)
}

// 상위 그룹 찾기
export async function getNextGroup(currentGroupTime) {
    return Group.findOne({ 
        groupTime: { $gt: currentGroupTime } 
    }).sort({ groupTime: 1 })
}

// 하위 그룹 찾기
export async function getPrevGroup(currentGroupTime) {
    return Group.findOne({ 
        groupTime: { $lt: currentGroupTime } 
    }).sort({ groupTime: -1 })
}

// 그룹명 중복 체크 (수정용, 자기 자신 제외)
export async function findByGroupNameExcludingId(groupName, excludeId) {
    return Group.findOne({
        groupName,
        _id: { $ne: excludeId },
    })
}

// 그룹 색상 중복 체크 (수정용, 자기 자신 제외)
export async function findByGroupColorExcludingId(groupColor, excludeId) {
    return Group.findOne({
        groupColor,
        _id: { $ne: excludeId }
    })
}

// 그룹 조건 시간 중복 체크 (수정용, 자기 자신 제외)
export async function findByGroupTimeExcludingId(groupTime, excludeId) {
    return Group.findOne({
        groupTime,
        _id: { $ne: excludeId }
    })
}
