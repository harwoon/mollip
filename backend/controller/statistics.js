import express from "express"
import * as studyRepository from "../repository/study.js"
import * as authRepository from "../repository/auth.js"
import { getWeekRange, getYesterday } from "../util/date.js"
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