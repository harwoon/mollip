import dayjs from "dayjs"

import * as studyRepository from "../repository/study.js"
import * as statisticsRepository from "../repository/statistics.js"

import { getWeekRange } from "../util/date.js"
import { calculateStudyStatistics } from "../util/ratio.js"

export async function getTotal(req, res) {
    const { type, date } = req.query
    const userId = req.user._id

    let studies
    let sumTime = 0

    try {
        if (type === "daily") {
            studies = await studyRepository.getDailyByUserIdAndDate(userId, date)
        }
        else if (type === "weekly") {
            const { startDate, endDate } = getWeekRange(date)
            studies = await studyRepository.getWeeklyByUserIdAndDate(userId, startDate, endDate)
        }
        else if (type === "monthly") {
            const month = date.slice(0, -3)
            studies = await studyRepository.getMonthlyByUserIdAndDate(userId, month)
        }
        else {
            return res.status(400).json({ message: "올바른 type을 입력해주세요." })
        }
        studies.forEach((study) => {
            sumTime += study.sumStudyTime;
        })

        return res.status(200).json(sumTime)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "서버 오류로 총 공부시간을 불러오지 못했습니다." })
    }
}

export async function getRatio(req, res) {
  const { type, date } = req.query
  const userId = req.user._id

  try {
    let studies = []

    if (type === "daily") {
      studies =
        await studyRepository.getDailyByUserIdAndDate(
          userId,
          date,
        )
    } else if (type === "weekly") {
      const { startDate, endDate } =
        getWeekRange(date)

      studies =
        await studyRepository.getWeeklyByUserIdAndDate(
          userId,
          startDate,
          endDate,
        )
    } else if (type === "monthly") {
      const month = date.slice(0, -3)

      studies =
        await studyRepository.getMonthlyByUserIdAndDate(
          userId,
          month,
        )
    } else {
      return res.status(400).json({
        message: "올바른 type을 입력해주세요.",
      })
    }


    console.log("조회된 공부 기록:", studies)

    const {
      totalStudyTime,
      subjects,
    } = await calculateStudyStatistics(
      studies,
      userId,
    )

    return res.status(200).json({
      type,
      date,
      totalStudyTime,
      subjects,
    })
  } catch (error) {
    console.error("getRatio 오류:", error)

    return res.status(500).json({
      message:
        "서버 오류로 공부 기록을 불러오지 못했습니다.",
    })
  }

}


// 그룹 연속 공부 달성일
export async function getStreak(req, res) {
    const groupId = req.user.groupId
    const userStreak = req.user.currentStreak

    try {

        const groupStreak = await statisticsRepository.getTotalStreak(groupId)

        return res.status(200).json({ userStreak, groupStreak })

    } catch (error) {
        console.error("그룹 연속 공부 달성일 조회 실패:", error)
        return res.status(500).json({ message: "서버 오류로 그룹 연속 공부 달성일을 불러오지 못했습니다." })
    }
}

// 그룹 주간 일별 공부 시간 
export async function getWeeklyCompareStats(req, res) {
    const userId = req.user._id
    const groupId = req.user.groupId
    const { date } = req.query

    try {
        // 해당 날짜가 포함된 주의 월요일(startDate)과 일요일(endDate) 구하기 (기존 함수 활용)
        const { startDate, endDate } = getWeekRange(date)

        // 비동기로 개인 통계와 그룹 통계를 동시에 가져와 속도 향상
        const [personalStats, groupStats] = await Promise.all([
            statisticsRepository.getWeeklyStatsByUser(userId, startDate, endDate),
            statisticsRepository.getWeeklyStatsByGroup(groupId, startDate, endDate)
        ])

        // 차트에 넣을 7일치 배열 만들기
        const result = [];
        const dayNames = ['일', '월', '화', '수', '목', '금', '토']

        let current = dayjs(startDate);

        // 월요일부터 7일간 반복하면서 데이터 끼워 넣기
        for (let i = 0; i < 7; i++) {
            const dateStr = current.format('YYYY-MM-DD')
            const dayStr = dayNames[current.day()]

            // DB에서 꺼내온 데이터 중 해당 날짜의 데이터 찾기
            const pRecord = personalStats.find(s => s._id === dateStr)
            const gRecord = groupStats.find(s => s.date === dateStr)

            result.push({
                day: dayStr,
                personalTime: pRecord ? Number((pRecord.totalTime / 60).toFixed(1)) : 0,
                groupTime: gRecord ? Number((gRecord.averageTime / 60).toFixed(1)) : 0
            })

            // 다음 날짜로 넘어감
            current = current.add(1, 'day')
        }

        return res.status(200).json(result)

    } catch (error) {
        console.error("주간 비교 통계 에러:", error);
        return res.status(500).json({ message: "비교 통계를 불러오지 못했습니다." })
    }
}