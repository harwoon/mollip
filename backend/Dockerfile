FROM node:24-slim

WORKDIR /app

# 의존성만 먼저 복사/설치 (캐시 활용, 코드만 바뀌면 재설치 안 함)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
