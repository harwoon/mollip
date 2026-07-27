import mongoose from "mongoose"
import * as todoRepository from "../repository/todo.js"

// Todo 목록 조회
export async function getTodoList(req, res) {
    const userId = req.user._id

    try{
        const todoList = await todoRepository.getTodoListByUserId(userId)

        // 아직 TodoList 없으면 빈 배열 반환
        if(!todoList){
            return res.status(200).json({
                todo: []
            })
        }

        return res.status(200).json(todoList)
    }catch (error) {
        console.error(error)

        return res.status(500).json({
            message: "서버 오류로 Todo 목록을 불러오지 못했습니다."
        })
    }
}


// Todo 추가
export async function addTodo(req, res) {
    const userId = req.user._id

    // 프론트에 전달받은 Todo 내용
    const {todo} = req.body

    // Todo 내용이 없거나 공백인 경우
    if(!todo || !todo.trim()){
        return res.status(400).json({
            message: "할 일을 입력해주세요."
        })
    }

    try{
        // 로그인한 사용자의 TodoList에 Todo 추가
        const todoList = await todoRepository.addTodo(
            userId,
            todo.trim()
        )
        // 해당 사용자의 TodoList 문서가 없는 경우
        if (!todoList) {
            return res.status(404).json({
                message: "TodoList를 찾을 수 없습니다."
            })
        }
        // Todo 추가
        return res.status(201).json({
            message: "Todo가 성공적으로 추가되었습니다!",
            todoList
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "서버 오류로 Todo를 추가하지 못했습니다."
        })
    }
}

// Todo 완료여부
export async function updateTodoState(req, res) {
    const userId = req.user._id
    const { todoId } = req.params
    const { state } = req.body

    // Todo ID 형식 검증
    if (!mongoose.isValidObjectId(todoId)) {
        return res.status(400).json({
            message: "올바르지 않은 Todo ID입니다."
        })
    }

    // 완료 여부는 true 또는 false만 허용
    if (typeof state !== "boolean") {
        return res.status(400).json({
            message: "state는 true 또는 false만 가능합니다."
        })
    }

    try {
        const todoList = await todoRepository.updateTodoState(
            userId,
            todoId,
            state
        )
        // Todo를 찾지 못한 경우
        if (!todoList) {
            return res.status(404).json({
                message: "Todo를 찾을 수 없습니다."
            })
        }
        // 상태변경 완료
        return res.status(200).json({
            message: "Todo 상태가 성공적으로 변경되었습니다.",
            todoList
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "서버 오류로 Todo 상태를 변경하지 못했습니다."
        })
    }
}



// Todo 삭제
export async function deleteTodo(req, res) {
    const userId = req.user._id
    const {todoId} = req.params

    try{
        // todo가 삭제되면 TodoList는 수정되는것임
        const updatedTodoList = await todoRepository.deleteTodo(userId, todoId)

        if(!updatedTodoList){
            return res.status(404).json({
                message: "삭제할 Todo를 찾을 수 없습니다."
            })
        }
        return res.status(200).json({
            message: "Todo가 삭제되었습니다."
        })
    }catch (error){
        console.error("Todo 삭제 오류:", error)

        return res.status(500).json({
            message: "서버 오류로 Todo를 삭제하지 못했습니다."
        })
    }

}
