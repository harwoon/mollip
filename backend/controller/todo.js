import mongoose from "mongoose"
import * as todoRepository from "../repository/todo.js"
import { getWeekRange } from "../util/date.js"

// Todo 목록 조회
export async function getTodoList(req, res) {

    
    const userId = req.user._id

    try{
        const todoList = await todoRepository.getTodoListByUserId(userId)

        // 오늘 TodoList 없으면 빈 배열 반환
        if(!todoList){
            return res.status(200).json({
                todo: []
            })
        }

        return res.status(200).json(todoList)
    }catch (error) {
        console.error("Todo 목록 조회 오류:", error)

        return res.status(500).json({
            message: "서버 오류로 Todo 목록을 불러오지 못했습니다."
        })
    }
}

// Todo 추가
export async function addTodo(req, res) {
    const userId = req.user._id

    
    
    // 프론트에 전달받은 Todo 내용
    const {todo, todoDate} = req.body

    // Todo 내용이 없거나 공백인 경우
    if(!todo || !todo.trim()){
        return res.status(400).json({
            message: "할 일을 입력해주세요."
        })
    }

    // 날짜 검증
    if (!todoDate) {
        return res.status(400).json({
            message: "Todo 날짜를 입력해주세요."
        })
    }

    try{
        // 로그인한 사용자의 TodoList에 Todo 추가
        const todoList = await todoRepository.addTodo(
            userId,
            todo.trim(),
            todoDate
        )

        // Todo 추가
        return res.status(201).json({
            message: "Todo가 성공적으로 추가되었습니다!",
            todoList
        })
    } catch (error) {
        console.error("Todo 추가 오류:", error)

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
        console.error("Todo 상태 변경 오류:", error)

        return res.status(500).json({
            message: "서버 오류로 Todo 상태를 변경하지 못했습니다."
        })
    }
}

// Todo 삭제
export async function deleteTodo(req, res) {
    const userId = req.user._id
    const {todoId} = req.params

    // Todo ID 형식 검증
    if (!mongoose.isValidObjectId(todoId)) {
        return res.status(400).json({
            message: "올바르지 않은 Todo ID입니다."
        })
    }

    try{
        // todo가 삭제되면 TodoList는 수정되는것임
        const updatedTodoList = await todoRepository.deleteTodo(userId, todoId)

        if(!updatedTodoList){
            return res.status(404).json({
                message: "삭제할 Todo를 찾을 수 없습니다."
            })
        }
        return res.status(200).json({
            message: "Todo가 삭제되었습니다.",
            todoList : updatedTodoList
        })
    }catch (error){
        console.error("Todo 삭제 오류:", error)

        return res.status(500).json({
            message: "서버 오류로 Todo를 삭제하지 못했습니다."
        })
    }
}


// 일간,주간,월간 기록 가져오기
export async function getRecords(req, res) {

    const { type, date } = req.query
    const userId = req.user._id

    if (!type || !date) {
        return res.status(400).json({
            message: "type과 date를 입력해주세요."
        })
    }

    try {
        let todoLists

        // 일간
        if (type === "daily") {
            todoLists = await todoRepository.getDailyByUserIdAndDate(userId, date)
        }
        else if (type === "weekly") {
            const { startDate, endDate } = getWeekRange(date)
            todoLists = await todoRepository.getWeeklyByUserIdAndDate(userId, startDate, endDate)
        }
        else if (type === "monthly") {
            const month = date.slice(0, -3)
            todoLists = await todoRepository.getMonthlyByUserIdAndDate(userId, month)
        }
        else {
            return res.status(400).json({ 
                message: "올바른 type을 입력해주세요." 
            })
        }

        return res.status(200).json(todoLists)

    } catch (error) {
        console.error("Todo 기록 조회 오류:", error)

        return res.status(500).json({ message: "서버 오류로 공부 기록을 불러오지 못했습니다." })
    }
}

// // 일간 목표 달성률
// export async function getDailyAchievement(req, res) {
//     const {date} = req.query
//     const userId = req.user._id

//     if(!date){
//         return res.status(400).json({
//             message: "date를 입력해주세요."
//         })
//     }

//     try{
//         const achievement = await todoRepository.getDailyAchievement(
//             userId, date
//         )

//         return res.status(200).json({
//             todoDate: date,
//             ...achievement
//         })

//     } catch(error){
//         console.error("Todo 목표 달성률 조회 오류:", error)

//         return res.status(500).json({
//             message:
//                 "서버 오류로 Todo 목표 달성률을 불러오지 못했습니다."
//         })
//     }
// }

// 일간,주간,월간 목표 달성률
export async function getAchievement(req, res) {
    const {type, date} = req.query
    const userId = req.user._id

    if(!type || !date){
        return res.status(400).json({
            message: "type과 date를 입력해주세요."
        })
    }

    try{
        let todoLists
        let period  // 조회기간

        // 일간 조회
        if(type === "daily"){
            const dailyTodoList = await todoRepository.getDailyByUserIdAndDate(
                userId, date
            )

            // reduce() 사용 위함: 문서가 있으면 배열에 넣고, 없으면 빈 배열에 만듦
            todoLists = dailyTodoList
                ? [dailyTodoList]
                : []

            period = {
                startDate: date,
                endDate: date
            }
        }

        // 주간 조회
        else if(type === "weekly"){
            const {startDate, endDate} = getWeekRange(date)

            todoLists = await todoRepository.getWeeklyByUserIdAndDate(
                userId,
                startDate,
                endDate
            )

            period = {
                startDate,
                endDate
            }
        }

        // 월간 조회
        else if(type === "monthly"){
            // 2026-07-27을 2026-07로 조회
            const month = date.slice(0, 7)

            todoLists = await todoRepository.getMonthlyByUserIdAndDate(
                userId,
                month
            )

            period = {
                month
            }
        }

        // 일, 월, 주가 아닌 값
        else{
            return res.status(400).json({
                message: "type은 daily, weekly, monthly 중 하나여야 합니다."
            })
        }

        // 조회기간에 포함된 TodoList 순회하며 todo 길이(전체)
        const totalCount = todoLists.reduce(
            (sum, todoList) => {return sum + todoList.todo.length}, 0
        )

        // 조회기간에 포함된 TodoList 순회하며 state: true(완료)개수
        const completedCount = todoLists.reduce(
            (sum, todoList) => {
                const completedTodoCount = todoList.todo.filter(
                    (todoItem) => todoItem.state === true
                ).length
                
                return sum + completedTodoCount
            }, 0
        )

        // 목표달성률 계산: 전체 Todo가 없으면 0으로 나눌 수 없어 0 반환
        // Todo가 있으면 완료개수 / 전체개수 x 100
        const achievementRate =
            totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

        return res.status(200).json({
            type,
            ...period,
            totalCount,
            completedCount,
            achievementRate
        })

    } catch (error) {
        console.error("Todo 목표 달성률 조회 오류:", error)

        return res.status(500).json({
            message: "서버 오류로 Todo 목표 달성률을 불러오지 못했습니다."
        })
    }
}