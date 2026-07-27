import express from "express"
import * as todoController from "../controller/todo.js"
import { isAuth } from "../middleware/auth.js"

const router = express.Router()

// Todo 목록 조회
// GET http://127.0.0.1:3000/todo
router.get("/", isAuth, todoController.getTodoList)

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