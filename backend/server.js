import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import { config } from "./config.mjs"
import { connectDB } from "./db/database.js"
import authRouter from "./router/auth.js"
import adminRouter from "./router/admin.js"
import studyRouter from "./router/study.js"
import statRouter from "./router/statistics.js"
import todoRouter from "./router/todo.js"
import groupRouter from "./router/group.js"
import { startWeeklyGroupJob } from "./jobs/weeklyGroupJob.js"
import { startStreakJob } from "./jobs/streakJob.js"


const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

app.use("/auth", authRouter)
app.use("/study", studyRouter)
app.use("/statistics", statRouter)
app.use("/todo", todoRouter)
app.use("/admin", adminRouter)
app.use("/group", groupRouter)


app.use((req, res) => {
    res.sendStatus(404)
})

connectDB().then(() => {
    startWeeklyGroupJob()
    startStreakJob()

    app.listen(config.host.port, () => {
        console.log("웹 서버 실행 중 ...")
    })
}).catch((err) => {
    console.log("서버 연결 실패")
    console.error(err)
})