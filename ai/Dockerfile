FROM python:3.12-slim

WORKDIR /app

# 의존성만 먼저 복사/설치 (requirements.txt가 안 바뀌면 이 레이어가 캐시돼서 재빌드가 빨라짐)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# --host 0.0.0.0 필수: 없으면 컨테이너 내부에서만 접근 가능해 backend가 못 붙음
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
