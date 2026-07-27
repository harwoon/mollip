import mongoose from "mongoose"
import TodoList from "../models/Todo.js"
// import TodoList from "../models/Todo.js"

// 로그인한 사용자 TodoList 조회
export async function getTodoListByUserId(userId) {
    return TodoList.findOne({
        user: userId
    })
}

// Todo 추가
export async function addTodo(userId, todoContent) {
    // Todo 하나 구분하기 위한 고유 ID
    const newTodo = {
        // id: new mongoose.Types.ObjectId(),
        todo: todoContent,
        state: false
    }

    // TodoList 있으면 todo를 배열에 추가, 없으면 TodoList 생성하여 추가
    return TodoList.findOneAndUpdate(
        {
            user: userId
        },
        {
            // 새로운 todo 추가
            $push: {todo: newTodo}
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