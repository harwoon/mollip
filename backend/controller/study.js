import express from "express"
import * as studyRepository from "../repository/study.js"

// 공부 기록 추가
export async function addStudy(req, res) {
    const { userId, studyTitle, startTime, endTime } = req.body

    //sumStudyTime
    const start = new Date(startTime)
    const end = new Date(endTime)

    const sumStudyTime = Math.floor((end - start) / 1000)

    //studyDate
    const year = start.getFullYear()
    const month = String(start.getMonth() + 1).padStart(2, '0')
    const date = String(start.getDate()).padStart(2, '0')
    const studyDate = `${year}-${month}-${date}`

    try {
        const studyRecord = await studyRepository.createStudy(
            { userId, studyTitle, studyDate, startTime, endTime, sumStudyTime }
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