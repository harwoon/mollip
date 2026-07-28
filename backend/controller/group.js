import express from "express"
import * as groupRepository from "../repository/group.js"
import { assignWeeklyGroups } from "../service/weeklyGroupService.js"

export async function addGroup(req, res) {

    try {

        const { groupName, groupColor, groupTime } = req.body

        if (
            !groupName?.trim() ||
            !groupColor?.trim() ||
            groupTime === undefined ||
            groupTime === null ||
            groupTime === ""
        ) {
            return res.status(400).json({
                message: "그룹명, 그룹 색상, 그룹 시간은 필수입니다.",
            })
        }

        const time = Number(groupTime)



        if (Number.isNaN(time)) {
            return res.status(400).json({
                message: "최소 공부시간은 숫자여야합니다.",
            })
        }



        if (time < 0) {
            return res.status(400).json({
                message: "최소 공부시간은 0 이상이어야 합니다.",
            })
        }

        const existingGroup =
            await groupRepository.findByGroupName(
                groupName.trim()
            )

        if (existingGroup) {
            return res.status(409).json({
                message: "그룹명이 중복 되었습니다.",
            })
        }

        const existingGroupTime = await groupRepository.findByGroupTime(time)

        if (existingGroupTime) {
            return res.status(409).json({
                message: "기준 시간이 중복 되었습니다.",
            })

        }

        const group = await groupRepository.createGroup({
            groupName: groupName.trim(),
            groupColor: groupColor.trim(),
            groupTime: time,
        })

        return res.status(201).json({
            message: "그룹이 등록되었습니다.",
            group,
        })
    } catch (error) {
        console.error("그룹 등록 오류:", error)

        // unique 인덱스 중복 오류
        if (error.code === 11000) {
            return res.status(409).json({
                message: "그룹명 또는 기준 시간이 중복되었습니다.",
            })
        }

        return res.status(500).json({
            message: "그룹 등록 중 오류가 발생했습니다.",
        })
    }

}


export async function runWeeklyGroupAssignment(req, res, next) 
{
    try {
        const result =
            await assignWeeklyGroups()

        return res.status(200).json({
            message: "주간 그룹 배정이 완료되었습니다.",
            result,
        })
    } catch (error) {
        next(error)
    }
}