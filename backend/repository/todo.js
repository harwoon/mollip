import mongoose from "mongoose"
import TodoList from "../models/Todo.js"

// 로그인한 사용자 TodoList 조회
export async function getTodoListByUserId(userId) {
    return TodoList.findOne({
        user: userId
    })
}

// Todo 추가
export async function addTodo(userId, todoContent, todoDate) {
    // Todo 하나 구분하기 위한 고유 ID
    const newTodo = {
        // id: new mongoose.Types.ObjectId(),
        todo: todoContent,
        state: false
    }

    // TodoList 있으면 todo를 배열에 추가, 없으면 TodoList 생성하여 추가
    return TodoList.findOneAndUpdate(
        {
            user: userId,
            todoDate
        },
        {
            // 새로운 todo 추가
            $push: {
                todo: newTodo
            }
        },
        {
            // 수정된 문서 반환
            new: true,
            upsert: true // update insert
        }
    )
}

// Todo 완료 여부 수정
export async function updateTodoState(userId, todoId, state) {
    // 잘못된 ObjectId 전달된 경우
    if(!mongoose.isValidObjectId(todoId)){
        return null
    }

    return TodoList.findOneAndUpdate(
        {
            user: userId,
            "todo._id": todoId
        },
        {
            $set: {
                "todo.$.state": state
            }
        },
        {
            new: true
        }
    )
}

// Todo 삭제
export async function deleteTodo(userId, todoId) {
    if(
        !mongoose.isValidObjectId(userId) ||
        !mongoose.isValidObjectId(todoId)
    ){
        return null
    }
    // TodoList안에 todo를 삭제하는건 배열을 수정하는 개념이라 Update임
    // Todo가 독립 컬션이면 Delete 가능
    return TodoList.findOneAndUpdate(
        {
            user: userId,
            "todo._id": todoId
        },
        {
            $pull: {
                todo: {_id: todoId}
            }
        },
        {
            new: true
        }
    )
}

// 일간 TodoList 조회
export async function getDailyByUserIdAndDate(userId, date) {
    return TodoList.findOne({ 
        user: userId, 
        todoDate: date 
    })
}

// 주간 todoList 조회
export async function getWeeklyByUserIdAndDate(userId, startDate, endDate) {
    return TodoList.find({
        user: userId,
        todoDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({
        todoDate: 1
    })
    
}

// 월간 TodoList 조회
export async function getMonthlyByUserIdAndDate(userId, month) {
    return TodoList.find({
        user: userId,
        todoDate: {
            $regex: `^${month}`
        }
    }).sort({
        todoDate: 1
    })
}

// 일간 목표 달성률
export async function getDailyAchievement(userId, date) {
    const todoList = await TodoList.findOne({
        user: userId,
        todoDate: date
    })

    // 해당 날짜 TodoList 없는 경우
    if(!todoList){
        return{
            totalCount: 0,      // 전체
            completedCount: 0,  // 완료
            achievementRate: 0  // 목표달성률
        }
    }

    // 해당 날짜 전체 todo 개수
    const totalCount = todoList.todo.length

    // todo의 state: ture
    const completedCount = todoList.todo.filter(
        (todoItem) => todoItem.state === true
    ).length

    // 목표달성률 계산
    // 전체 Todo 0일경우 0으로 나누면 오류발생 : 0 반환
    // Todo 존재하면 완료개수 / 전체개수 * 100
    // Math.round(): 소수점 첫째자리에서 반올림해 정수 반환
    const achievementRate = 
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

    return{
        totalCount, completedCount, achievementRate
    }
}

// 여러 사용자의 주간 Todo 목록 조회
export async function getWeeklyTodoListsByUsers(userIds, startDate, endDate) {
    return TodoList.find({
        user: {$in: userIds},
        todoDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({todoDate: 1}).lean()
}

// 개인 투두리스트 삭제
export const deleteMany = async (userId) => {
    return await TodoList.deleteMany({ user: userId })
}