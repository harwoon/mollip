import express from "express";
import http from "http";
import { Server } from "socket.io";
// import Redis from 'ioredis'
import redisClient from "./db/redis.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.mjs";
import { connectDB } from "./db/database.js";
import authRouter from "./router/auth.js";
import adminRouter from "./router/admin.js";
import studyRouter from "./router/study.js";
import statRouter from "./router/statistics.js";
import todoRouter from "./router/todo.js";
import groupRouter from "./router/group.js";
import aiRouter from "./router/ai.js";
import scheduleRouter from "./router/Schedule.js";
import { startWeeklyGoalReminderJob } from "./jobs/weeklyGoalReminderJob.js";
import { startWeeklyGroupJob } from "./jobs/weeklyGroupJob.js";
import { startStreakJob } from "./jobs/streakJob.js";
import { startDormantGroupJob } from "./jobs/dormantGroupJob.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 하드코딩 되어있던 주소 수정
const corsOptions = {
  origin: config.cors.allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

// 아래 코드 db/redis.js 파일로 옮김 (사유: 관리자랑 클라이언트랑 공유 모듈 만들려고 파일 새로 생성함)
// const redisClient = new Redis()
// redisClient.on('connect', () => console.log('Redis 연결 성공'));
// redisClient.on('error', (err) => console.log('Redis Client Error', err));

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/study", studyRouter);
app.use("/statistics", statRouter);
app.use("/todo", todoRouter);
app.use("/admin", adminRouter);
app.use("/group", groupRouter);
app.use("/schedule", scheduleRouter);
app.use("/ai", aiRouter);

io.on("connection", (socket) => {
  console.log("소켓 연결됨:", socket.id);

  socket.on("joinAdminRoom", () => {
    socket.join("admin_room");
    console.log("관리자가 admin_room에 입장했습니다.");
  });

  // 그룹 페이지 입장
  socket.on("joinGroup", async ({ groupId } = {}, done) => {
    const groupKey = String(groupId ?? "").trim();

    if (!groupKey) {
      if (typeof done === "function") {
        done({
          ok: false,
          message: "groupId가 필요합니다.",
        });
      }

      return;
    }

    socket.join(groupKey);

    try {
      const activeUsers = await redisClient.hgetall(`study:${groupKey}`);

      socket.emit("currentActiveUsers", activeUsers);

      if (typeof done === "function") {
        done({ ok: true });
      }
    } catch (error) {
      console.error("Redis 데이터 가져오기 실패:", error);

      if (typeof done === "function") {
        done({
          ok: false,
          message: "공부 중 사용자 조회에 실패했습니다.",
        });
      }
    }
  });

  // 그룹 페이지에서는 나가지만 공용 소켓 연결은 유지
  socket.on("leaveGroup", ({ groupId } = {}) => {
    const groupKey = String(groupId ?? "").trim();

    if (!groupKey) {
      return;
    }

    socket.leave(groupKey);
  });

  // 공부 시작
  socket.on(
    "startStudy",
    async (
      { groupId, userId, userName, profileImg, subjectName } = {},
      done,
    ) => {
      const groupKey = String(groupId ?? "").trim();
      const userKey = String(userId ?? "").trim();

      if (!groupKey || !userKey) {
        if (typeof done === "function") {
          done({
            ok: false,
            message: "groupId와 userId가 필요합니다.",
          });
        }

        return;
      }

      const redisKey = `study:${groupKey}`;

      try {
        /*
         * 이미 Redis에 공부 중 정보가 있으면
         * 기존 시작 시간을 그대로 사용합니다.
         *
         * 따라서 새로고침 후 startStudy 이벤트가
         * 다시 전달되어도 시간이 초기화되지 않습니다.
         */
        let startTime = Date.now();
        let savedUserData = {};

        const savedUser = await redisClient.hget(redisKey, userKey);

        if (savedUser) {
          try {
            savedUserData = JSON.parse(savedUser);

            const savedStartTime = Number(savedUserData.startTime);

            if (savedStartTime && !Number.isNaN(savedStartTime)) {
              startTime = savedStartTime;
            }
          } catch (parseError) {
            console.error("기존 공부 사용자 데이터 변환 실패:", parseError);
          }
        }

        const activeUser = {
          userName: userName ?? savedUserData.userName ?? "",

          startTime,

          profileImg: profileImg ?? savedUserData.profileImg ?? "",

          subjectName: subjectName ?? savedUserData.subjectName ?? "",
        };

        await redisClient.hset(redisKey, userKey, JSON.stringify(activeUser));

        /*
         * socket.to()는 이벤트를 보낸 본인을 제외합니다.
         * io.to()를 사용하면 해당 그룹의 모든 사용자에게
         * 공부 시작 정보가 전달됩니다.
         */
        io.to(groupKey).emit("userStartedStudy", {
          userId: userKey,
          ...activeUser,
        });

        io.to("admin_room").emit("adminUserStarted", {
          groupId: groupKey,
          userId: userKey,
          ...activeUser,
        });

        if (typeof done === "function") {
          done({
            ok: true,
            startTime,
          });
        }
      } catch (error) {
        console.error("Redis 저장 실패:", error);

        if (typeof done === "function") {
          done({
            ok: false,
            message: "공부 시작 처리에 실패했습니다.",
          });
        }
      }
    },
  );

  /*
   * 공부 종료
   *
   * Stop 버튼을 눌러서 stopStudy 이벤트가 들어왔을 때만
   * Redis에서 공부 중 사용자를 삭제합니다.
   */
  socket.on("stopStudy", async ({ groupId, userId } = {}, done) => {
    const groupKey = String(groupId ?? "").trim();
    const userKey = String(userId ?? "").trim();

    if (!groupKey || !userKey) {
      if (typeof done === "function") {
        done({
          ok: false,
          message: "groupId와 userId가 필요합니다.",
        });
      }

      return;
    }

    try {
      await redisClient.hdel(`study:${groupKey}`, userKey);

      io.to(groupKey).emit("userStoppedStudy", {
        userId: userKey,
      });

      io.to("admin_room").emit("adminUserStopped", {
        userId: userKey,
      });

      if (typeof done === "function") {
        done({ ok: true });
      }
    } catch (error) {
      console.error("Redis 삭제 실패:", error);

      if (typeof done === "function") {
        done({
          ok: false,
          message: "공부 종료 처리에 실패했습니다.",
        });
      }
    }
  });

  /*
   * 중요
   *
   * 새로고침도 disconnect로 처리됩니다.
   * 따라서 disconnect에서는 Redis 데이터를 삭제하지 않습니다.
   */
  socket.on("disconnect", (reason) => {
    console.log("소켓 연결 끊김:", socket.id, reason);
  });
});

app.use((req, res) => {
  res.sendStatus(404);
});

connectDB()
  .then(() => {
    startWeeklyGroupJob();
    startStreakJob();
    startDormantGroupJob();
    startWeeklyGoalReminderJob();

    server.listen(config.host.port, () => {
      console.log(
        `웹 서버 및 소켓 서버 실행 중 (포트: ${config.host.port}) ...`,
      );
    });
  })
  .catch((err) => {
    console.log("서버 연결 실패");
    console.error(err);
  });
