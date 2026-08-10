import Redis from "ioredis"
import { config } from "../config.mjs"

const redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port
})

redisClient.on("connect", () => console.log("Redis 연결 성공"))
redisClient.on("error", (err) => console.log("Redis Client Error", err))

export default redisClient