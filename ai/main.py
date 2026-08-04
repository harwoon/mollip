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
    startTime: str          # 공부한 시간대 (예: "09:00~10:30" 또는 "오전")
    hours: float       # 해당 세션의 공부 시간

class DailyRecord(BaseModel):
    day: str
    dailyTotalHours: float       # 하루 총 공부 시간 (Node.js가 계산)
    sessions: List[SessionRecord]

class WeeklyStudyData(BaseModel):
    userName: str
    totalStudyHours: int
    achievementRate: int
    topSubjects: list[str]
    missedTodos: list[str]
    dailyRecords: List[DailyRecord]

# 2. 리포트 생성 API 엔드포인트
@app.post("/ai/weekly-report")
async def generate_weekly_report(data: WeeklyStudyData):
    try:
        # 프롬프트 작성
        system_prompt = """
        당신은 사용자의 주간 학습 데이터를 분석하여 날카롭고 다정한 학습 코칭을 제공하는 1:1 AI 튜터입니다.
        사용자의 이번 주 데이터를 바탕으로 아래 4가지 영역에 대한 분석 결과를 반드시 JSON 형식으로만 반환하세요.
        JSON 키값과 구조는 아래 형식을 엄격하게 지켜야 합니다.

        [출력 JSON 구조]
        {
          "diagnosis": "최근 학습 패턴에 대한 1~2줄의 짧고 명확한 총평",
          "patterns": [
            {
              "title": "발견된 패턴 요약 (예: 주말에 학습이 몰리는 경향이 있어요.)",
              "description": "해당 패턴에 대한 상세 설명 및 조언"
            }
          ],
          "recommendations": [
            {
              "day": "추천 요일 (예: 화요일)",
              "task": "추천 Todo 내용 (미달성 Todo나 주요 과목 기반)",
              "effect": "예상 효과 (예: 이해도 향상 및 복습 완료율 증가)"
            }
          ],
          "expectedChanges": [
            {
              "label": "변화 지표명 (예: Todo 달성률)",
              "from": "현재 수치 (예: 71%)",
              "to": "예상 수치 (예: 83% 내외)",
              "trend": "up 또는 down"
            }
          ]
        }
        """

        # 일별 데이터를 문자열 리스트로 변환
        daily_records_list = []
        for record in data.dailyRecords:
            if not record.sessions:
                session_detail = "공부 안 함"
            else:
                # 예: "React(1.0시간)""
                session_detail = ", ".join([f"{sess.subjectName}({sess.startTime} 시작, {sess.hours}시간)" for sess in record.sessions])
            
            # Node.js가 계산해준 일일 총시간을 맨 앞에 둬서 AI가 덧셈을 안 해도 되게 만듭니다.
            daily_records_list.append(f"- {record.day} (총 {record.dailyTotalHours}시간): {session_detail}")
        
        daily_records_str = "\n".join(daily_records_list)

        missed_todos_str = ', '.join(data.missedTodos) if data.missedTodos else '없음 (모두 달성!)'

        # user_prompt에 일별 기록 주입
        user_prompt = f"""
        [사용자 이름]: {data.userName}
        [이번 주 총 공부시간]: {data.totalStudyHours}시간
        [Todo 달성률]: {data.achievementRate}%
        [주요 공부 과목]: {', '.join(data.topSubjects)}
        
        [일별 공부 기록]
        {daily_records_str}

        [완료하지 못한(실패한) Todo 목록]: {missed_todos_str}
        
        위 데이터를 바탕으로 사용자의 요일별 학습 패턴을 분석하고, 실패한 Todo와 공백 요일을 고려하여 다음 주 추천 계획을 포함한 JSON 리포트를 작성해 주세요.
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