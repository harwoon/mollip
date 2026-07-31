import Redis from "ioredis"

const redisClient = new Redis()

redisClient.on("connect", () => console.log("Redis 연결 성공"))
redisClient.on("error", (err) => console.log("Redis Client Error", err))

export default redisClient