import express from "express"
import * as studyRepository from "../repository/study.js"
import * as authRepository from "../repository/auth.js"
import { getWeekRange, getYesterday } from "../util/date.js"

// 공부 기록 추가
export async function addStudy(req, res) {
    const userId = req.user._id
    const { studyTitle, studyDate, startTime, endTime } = req.body

    //sumStudyTime
    const start = new Date(startTime)
    const end = new Date(endTime)

    const sumStudyTime = Math.floor((end - start) / 1000)

    try {
        // 공부 기록 추가
        const studyRecord = await studyRepository.createStudy(
            { user: userId, studyTitle, studyDate, startTime, endTime, sumStudyTime }
        )

        // 연속 공부 일수 업데이트 하기
        const yesterdayStr = getYesterday(studyDate)

        // undefined인 경우 초기화
        let { currentStreak = 0, maxStreak = 0, lastStudyDate = "" } = req.user

        let streakUpdated = false // 업데이트가 필요한지 체크하는 플래그

        if (lastStudyDate === studyDate) {
            // 오늘 이미 기록이 존재하는 경우
            // continue
        } else if (lastStudyDate === yesterdayStr) {
            // 어제 기록 존재, 오늘 기록 존재
            currentStreak += 1
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak // 최대 기록 갱신
            }
            lastStudyDate = studyDate
            streakUpdated = true
        } else {
            // 끊겼다가 다시 시작
            currentStreak = 1
            if (maxStreak === 0) maxStreak = 1 // max를 1로
            lastStudyDate = studyDate
            streakUpdated = true
        }

        if (streakUpdated) {
            await authRepository.updateStreak(userId, currentStreak, maxStreak, lastStudyDate);
        }

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

export async function getRecordsbySubject(req, res) {
    console.log("컨트롤러")

    const { type, subject, date } = req.query
    const userId = req.user._id

    console.log(subject)

    try {
        let studies

        if (type === "daily") {
            studies = await studyRepository.getDailyByUserIdAndSubjectAndDate(userId, subject, date)
        }
        else if (type === "weekly") {
            const { startDate, endDate } = getWeekRange(date)
            studies = await studyRepository.getWeeklyByUserIdAndSubjectAndDate(userId, subject, startDate, endDate)
        }
        else if (type === "monthly") {
            const month = date.slice(0, -3)
            studies = await studyRepository.getMonthlyByUserIdAndSubjectAndDate(userId, subject, month)
        }
        else {
            return res.status(400).json({ message: "올바른 type을 입력해주세요." })
        }

        return res.status(200).json(studies)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "서버 오류로 과목 공부 기록을 불러오지 못했습니다." })
    }
}