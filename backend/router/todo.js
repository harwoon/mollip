import express from "express"
import * as todoController from "../controller/todo.js"
import { isAuth } from "../middleware/auth.js"

const router = express.Router()

// Todo 목록 조회
// GET http://127.0.0.1:3000/todo
router.get("/", isAuth, todoController.getTodoList)

// 일간 목표달성률 조회
// http://127.0.0.1:3000/todo/achievement?type=daily&date=2026-07-27
// http://127.0.0.1:3000/todo/achievement?type=weekly&date=2026-07-27
// http://127.0.0.1:3000/todo/achievement?type=monthly&date=2026-07-27
router.get("/achievement", isAuth, todoController.getAchievement)

// 일간/주간/월간 기록 조회
// http://127.0.0.1:3000/todo/records?type=daily&date=2026-07-27
// http://127.0.0.1:3000/todo/records?type=weekly&date=2026-07-27
// http://127.0.0.1:3000/todo/records?type=monthly&date=2026-07-27
router.get("/records", isAuth, todoController.getRecords)

// Todo 추가
// POST http://127.0.0.1:3000/todo
router.post("/", isAuth, todoController.addTodo)

// Todo 완료 여부 변경
// PATCH http://127.0.0.1:3000/todo/:todoId/state
router.patch("/:todoId/state", isAuth, todoController.updateTodoState)

// Todo 삭제
// DELETE http://127.0.0.1:3000/todo/:todoId
router.delete("/:todoId", isAuth, todoController.deleteTodo)

export default router