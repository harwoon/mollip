import express from "express"
import * as studyRepository from "../repository/study.js"
import { getWeekRange } from "../util/date.js"

// 공부 기록 추가
export async function addStudy(req, res) {
    const userId = req.user._id
    const { studyTitle, startTime, endTime } = req.body

    //sumStudyTime
    const start = new Date(startTime)
    const end = new Date(endTime)

    const sumStudyTime = Math.floor((end - start) / 1000)

    //studyDate
    const year = start.getFullYear()
    const month = String(start.getMonth() + 1).padStart(2, '0')
    const date = String(start.getDate()).padStart(2, '0')
    //padStart(2,"0") 문자열 길이 2자리로 맞추고, 모자라면 "0" 넣음
    const studyDate = `${year}-${month}-${date}`

    try {
        const studyRecord = await studyRepository.createStudy(
            { user: userId, studyTitle, studyDate, startTime, endTime, sumStudyTime }
        )

        return res.status(201).json({
            message: "공부 기록이 성공적으로 추가되었습니다.",
            studyRecord
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "서버 오류로 기록을 저장하지 못했습니다." })
    }
}

// 일간,주간,월간 기록 가져오기
export async function getRecords(req, res) {

    const { type, date } = req.query
    const userId = req.user._id

    try {
        let studies

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

        return res.status(200).json(studies)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "서버 오류로 공부 기록을 불러오지 못했습니다." })
    }
}

export async function getWeeklyRecords(req, res) {

    const { date } = req.query
    const userId = req.user._id

    try {
        const studies = await studyRepository.getWeeklyByUserIdAndDate(userId, date)
        console.log(studies)
        return res.status(200).json(studies)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "서버 오류로 주간 기록을 불러오지 못했습니다." })
    }

}