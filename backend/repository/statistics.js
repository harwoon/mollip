import User from "../models/User.js"
import Study from "../models/Study.js"
import mongoose from "mongoose"
import TodoList from "../models/Todo.js"

// 그룹 평균 연속 공부 일수 
export async function getTotalStreak(groupId) {
    const users = await User.find({ groupId })
    const num = users.length

    if (num === 0) {
        return 0
    }

    let sum = 0
    users.forEach(user => {
        sum += (user.currentStreak || 0)
    })

    return sum / num;
}

// 개인의 주간 일별 공부시간 가져오기
export async function getWeeklyStatsByUser(userId, startDate, endDate) {
    return Study.aggregate([
        { 
            $match: { 
                user: new mongoose.Types.ObjectId(userId),
                studyDate: { $gte: startDate, $lte: endDate } 
            } 
        },
        { 
            $group: { 
                _id: "$studyDate", 
                totalTime: { $sum: "$sumStudyTime" } 
            } 
        }
    ])
}

// 그룹의 주간 일별 평균 공부시간 가져오기
export async function getWeeklyStatsByGroup(groupId, startDate, endDate) {
    const users = await User.find({ groupId }, '_id')
    const userIds = users.map(u => new mongoose.Types.ObjectId(u._id))
    const userCount = userIds.length || 1

    return Study.aggregate([
        { 
            $match: { 
                user: { $in: userIds }, 
                studyDate: { $gte: startDate, $lte: endDate } 
            } 
        },
        { 
            $group: { 
                _id: "$studyDate", 
                totalGroupTime: { $sum: "$sumStudyTime" } 
            } 
        },
        {
            $project: {
                date: "$_id",
                averageTime: { $divide: ["$totalGroupTime", userCount] },
                _id: 0
            }
        }
    ])
}


// 그룹 사용자 주간 Todo목록 조회 (그룹원 전체 + 주간 범위 조건으로 한 번만 조회함)
export async function getWeeklyTodoListsByUsers(userIds, startDate, endDate) {
    return await TodoList.find({
        user: {$in: userIds},
        todoDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).lean()
}