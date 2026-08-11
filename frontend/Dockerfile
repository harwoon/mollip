## 1단계: Vite 빌드
FROM node:24-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite는 런타임이 아니라 빌드 시점에 값을 코드에 박아넣기 때문에
# docker-compose의 environment가 아니라 build-time ARG로 받아야 함
ARG VITE_LOCAL_API_URL
ARG VITE_REMOTE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_DORMANT_GROUP_ID
ENV VITE_LOCAL_API_URL=$VITE_LOCAL_API_URL \
    VITE_REMOTE_API_URL=$VITE_REMOTE_API_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_DORMANT_GROUP_ID=$VITE_DORMANT_GROUP_ID

RUN npm run build

## 2단계: 빌드 결과물만 nginx로 서빙 (node, 소스코드 전부 제외 -> 이미지 용량 최소화)
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
