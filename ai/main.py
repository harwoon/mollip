import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from openai import OpenAI
from dotenv import load_dotenv

# uvicorn main:app --reload

load_dotenv()

app = FastAPI()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Express에서 넘어올 데이터 형식 정의
class SessionRecord(BaseModel):
    subjectName: str          # 과목명
    startTime: str          # 공부한 시간대 (예: "14:20")
    hours: float       # 해당 세션의 공부 시간

class DailyStudyData(BaseModel):
    userName: str
    segmentStudyHours: float       # 이번 리포트 구간(직전 리포트 이후 ~ 지금)의 공부 시간
    segmentSessions: List[SessionRecord]       # 구간 내 공부 세션 목록
    todayTotalHours: float       # 오늘 누적 총 공부 시간 (Node.js가 계산)
    achievementRate: int       # 오늘 Todo 달성률
    topSubjects: list[str]
    missedTodos: list[str]       # 오늘 완료하지 못한 Todo 목록
    currentStreak: int

# 2. 리포트 생성 API 엔드포인트
@app.post("/ai/daily-report")
async def generate_daily_report(data: DailyStudyData):
    try:
        # 프롬프트 작성
        system_prompt = """
        당신은 사용자의 학습 데이터를 분석하여 날카롭고 다정한 학습 코칭을 제공하는 1:1 AI 튜터입니다.
        사용자는 오늘 학습 중 누적 3시간 분량을 채울 때마다 리포트를 받습니다.
        이번에 전달되는 데이터는 "직전 리포트 이후부터 지금까지" 새로 쌓인 학습 구간(segment) 기록입니다.
        이 구간 데이터를 중심으로 분석하되, 오늘 누적 총 공부시간과 Todo 달성률도 참고하여 아래 4가지 영역에 대한
        분석 결과를 반드시 JSON 형식으로만 반환하세요.
        JSON 키값과 구조는 아래 형식을 엄격하게 지켜야 합니다.

        [출력 JSON 구조]
        {
          "diagnosis": {
            "summary": "이번 학습 구간에 대한 1~2줄의 짧고 명확한 총평",
            "immersionScore": "구간 공부시간, 과목 집중도, Todo 달성률 등을 종합하여 0~100 사이의 숫자로 도출한 몰입도 (정수만 입력, 예: 85)"
          },
          "patterns": [
            {
              "title": "발견된 패턴 요약 (예: 한 과목에 집중해서 학습했어요.)",
              "description": "해당 패턴에 대한 상세 설명 및 조언"
            } // 반드시 4개의 학습 패턴(객체)을 생성하세요.
          ],
          "recommendations": [
            {
              "day": "오늘",
              "task": "추천 Todo 내용 (미달성 Todo나 주요 과목 기반)",
              "duration": "예상 소요 시간 (예: 40분)",
              "effect": "예상 효과 (예: 이해도 향상 및 복습 완료율 증가)"
            }
            // 반드시 5개의 추천 항목(객체)을 생성하세요.
            // task에 요일이나 시간에 관한 내용을 넣지 마세요.
          ]
        }
        """

        # 구간 내 세션을 문자열로 변환
        if not data.segmentSessions:
            segment_sessions_str = "기록 없음"
        else:
            segment_sessions_str = "\n".join([
                f"- {sess.subjectName} ({sess.startTime} 시작, {sess.hours}시간)"
                for sess in data.segmentSessions
            ])

        missed_todos_str = ', '.join(data.missedTodos) if data.missedTodos else '없음 (모두 달성!)'

        # user_prompt에 구간 기록 주입
        user_prompt = f"""
        [사용자 이름]: {data.userName}
        [현재 연속 학습일]: {data.currentStreak}일
        [이번 리포트 구간 공부시간]: {data.segmentStudyHours}시간
        [오늘 누적 총 공부시간]: {data.todayTotalHours}시간
        [오늘 Todo 달성률]: {data.achievementRate}%
        [주요 공부 과목]: {', '.join(data.topSubjects)}

        [이번 구간 공부 기록]
        {segment_sessions_str}

        [오늘 완료하지 못한(실패한) Todo 목록]: {missed_todos_str}

        위 데이터를 바탕으로 이번 학습 구간의 패턴을 분석하고, 실패한 Todo와 남은 오늘 시간을 고려하여
        오늘 안에 실천할 수 있는 추천 계획을 포함한 JSON 리포트를 작성해 주세요.
        """

        # OpenAI API 호출
        response = client.chat.completions.create(
            model= "gpt-5-nano", #"gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
            #,temperature=0.7
        )

        # JSON 파싱
        ai_coaching_text = response.choices[0].message.content
        report_data = json.loads(ai_coaching_text) # 문자열을 진짜 파이썬 딕셔너리로 변환

        # 결과 반환
        return {
            "success": True,
            "report": report_data # JSON 객체가 반환
        }

    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail="AI 리포트 생성 중 오류가 발생했습니다.")
