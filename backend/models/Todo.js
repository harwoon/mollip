import mongoose from "mongoose"

const todoSchema = new mongoose.Schema(
    {
        todo: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: Boolean,
            default: false
        }
    }
)

// 사용자별 TodoList
const todoListSchema = new mongoose.Schema(
    {
        // TodoList 소유한 사용자
        user:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        // Todo 목록
        todo: {
            type: [todoSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
)

const TodoList = mongoose.model("TodoList", todoListSchema)

export default TodoList