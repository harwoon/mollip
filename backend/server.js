import express from "express"
import http from 'http'
import { Server } from 'socket.io'
// import Redis from 'ioredis'
import redisClient from "./db/redis.js"
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
import aiRouter from "./router/ai.js"
import scheduleRouter from "./router/Schedule.js"

import { startWeeklyGroupJob } from "./jobs/weeklyGroupJob.js"
import { startStreakJob } from "./jobs/streakJob.js"
import { startDormantGroupJob } from "./jobs/dormantGroupJob.js"


const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 하드코딩 되어있던 주소 수정
const corsOptions = {
    origin: config.cors.allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}

const server = http.createServer(app)
const io = new Server(server, {
    cors: corsOptions
})

app.set('io', io)

// 아래 코드 db/redis.js 파일로 옮김 (사유: 관리자랑 클라이언트랑 공유 모듈 만들려고 파일 새로 생성함)
// const redisClient = new Redis()
// redisClient.on('connect', () => console.log('Redis 연결 성공'));
// redisClient.on('error', (err) => console.log('Redis Client Error', err));

app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

app.use("/auth", authRouter)
app.use("/study", studyRouter)
app.use("/statistics", statRouter)
app.use("/todo", todoRouter)
app.use("/admin", adminRouter)
app.use("/group", groupRouter)
app.use("/schedule", scheduleRouter)
app.use('/ai', aiRouter)

io.on('connection', (socket) => {
    console.log('소켓 연결됨:', socket.id)

    socket.on('joinAdminRoom', () => {
        socket.join('admin_room')
        console.log('관리자가 admin_room에 입장했습니다.')
    })

    // 그룹 페이지 들어감
    socket.on('joinGroup', async ({ groupId }) => {
        socket.join(groupId)
        try {
            const activeUsers = await redisClient.hgetall(`study:${groupId}`)
            socket.emit('currentActiveUsers', activeUsers)
        } catch (error) {
            console.error("Redis 데이터 가져오기 실패:", error)
        }
    });

    // 공부 시작
    socket.on('startStudy', async ({ groupId, userId, userName, profileImg, subjectName }) => {
        const startTime = Date.now()
        socket.studyInfo = { groupId, userId }

        try {
            await redisClient.hset(`study:${groupId}`, userId, JSON.stringify({ userName, startTime, profileImg }))
            socket.to(groupId).emit('userStartedStudy', { userId, userName, startTime, profileImg })

            socket.to('admin_room').emit('adminUserStarted', {
                groupId, userId, userName, profileImg, subjectName, startTime
            })
        } catch (error) {
            console.error("Redis 저장 실패:", error)
        }
    })
    // 공부 종료
    socket.on('stopStudy', async ({ groupId, userId }) => {
        try {
            socket.studyInfo = null;

            await redisClient.hdel(`study:${groupId}`, userId)
            socket.to(groupId).emit('userStoppedStudy', { userId })
            socket.to('admin_room').emit('adminUserStopped', { userId })
        } catch (error) {
            console.error("Redis 삭제 실패:", error)
        }
    })

    socket.on('disconnect', async () => {
        console.log('소켓 연결 끊김:', socket.id)

        if (socket.studyInfo) {
            const { groupId, userId } = socket.studyInfo
            try {
                await redisClient.hdel(`study:${groupId}`, userId)
                io.to(groupId).emit('userStoppedStudy', { userId })
                io.to('admin_room').emit('adminUserStopped', { userId })
            } catch (error) {
                console.error("비정상 종료 Redis 삭제 실패:", error)
            }
        }
    })
})


app.use((req, res) => {
    res.sendStatus(404)
})

connectDB().then(() => {
    startWeeklyGroupJob()
    startStreakJob()
    startDormantGroupJob()

    server.listen(config.host.port, () => {
        console.log(`웹 서버 및 소켓 서버 실행 중 (포트: ${config.host.port}) ...`)
    })
}).catch((err) => {
    console.log("서버 연결 실패")
    console.error(err)
})