import Group from "../models/Group.js"

export async function createGroup(groupData) {
    return Group.create(groupData)
}
export async function findByGroupName(groupName) {
    return Group.findOne({
        groupName,
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