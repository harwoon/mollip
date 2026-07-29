import express from "express"
import * as groupRepository from "../repository/group.js"
import { assignWeeklyGroups } from "../service/weeklyGroupService.js"

// 그룹 목록 조회 (확인용)
export async function getGroups(req, res) {
    try{
        const groups = await groupRepository.findAllGroups()

        return res.status(200).json({
            message: "그룹 목록을 성공적으로 불러왔습니다.",
            groups
        })
    } catch(error) {
        console.error("그룹 목록 조회 오류: ", error)
        return res.status(500).json({
            message: "그룹 목록 조회 중 오류가 발생했습니다."
        })
    }
}

// 자신 그룹 조회
export async function getGroup(req,res){
    const groupId = req.user.groupId

    try {

        const group = await groupRepository.findById(groupId)
        return res.status(200).json(group)
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "서버 오류로 그룹 정보를 불러오지 못했습니다." })
    }
}

// 상위 그룹 조회
export async function getHigher(req, res) {
    const groupId = req.user.groupId

    try {

        const myGroup = await groupRepository.findById(groupId)
        if (!myGroup) {
            return res.status(404).json({ message: "내 그룹 정보를 찾을 수 없습니다." })
        }
        
        const currentGroupTime = myGroup.groupTime

        const higherGroup = await groupRepository.getNextGroup(currentGroupTime)

        if (!higherGroup) {
            return res.status(200).json({ message: "현재 최고 등급 그룹입니다.", data: null })
        }

        return res.status(200).json(higherGroup);

    } catch (error) {
        console.error("상위 그룹 조회 실패:", error);
        return res.status(500).json({ message: "서버 오류로 상위 그룹 정보를 불러오지 못했습니다." })
    }
}

// 하위 그룹 조회
export async function getLower(req, res) {
    const groupId = req.user.groupId

    try {
        const myGroup = await groupRepository.findById(groupId)
        if (!myGroup) {
            return res.status(404).json({ message: "내 그룹 정보를 찾을 수 없습니다." })
        }
        
        const currentGroupTime = myGroup.groupTime

        // 2. 내 그룹 시간을 기준으로 하위 그룹을 조회합니다.
        const lowerGroup = await groupRepository.getPrevGroup(currentGroupTime)

        // 하위 그룹이 없을 경우(최하위 등급)의 처리
        if (!lowerGroup) {
            return res.status(200).json({ message: "현재 최하위 등급 그룹입니다.", data: null })
        }

        return res.status(200).json(lowerGroup)

    } catch (error) {
        console.error("하위 그룹 조회 실패:", error)
        return res.status(500).json({ message: "서버 오류로 하위 그룹 정보를 불러오지 못했습니다." })
    }
}

// 그룹 추가
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
                message: "그룹명, 그룹 컬러, 그룹 조건 시간은 필수입니다.",
            })
        }

        const time = Number(groupTime)
        if (Number.isNaN(time)) {
            return res.status(400).json({
                message: "그룹 조건 시간은 숫자여야합니다.",
            })
        }
        if (time < 0) {
            return res.status(400).json({
                message: "그룹 조건 시간은 0 이상이어야 합니다.",
            })
        }

        const existingGroup =
            await groupRepository.findByGroupName(
                groupName.trim()
            )
        if (existingGroup) {
            return res.status(409).json({
                message: "이미 사용 중인 그룹명입니다.",
            })
        }

        const existingGroupColor = await groupRepository.findByColor(groupColor)
        if(existingGroupColor) {
            return res.status(409).json({
                message: "이미 사용 중인 컬러입니다."
            })
        }

        const existingGroupTime = await groupRepository.findByGroupTime(time)

        if (existingGroupTime) {
            return res.status(409).json({
                message: "이미 사용 중인 그룹 조건 시간입니다.",
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
                message: "그룹명, 그룹 컬러 또는 그룹 조건 시간이 중복되었습니다.",
            })
        }

        return res.status(500).json({
            message: "그룹 등록 중 오류가 발생했습니다.",
        })
    }

}

// 그룹 수정
export async function updateGroup(req, res) {
    try {
        const { id } = req.params
        const { groupName, groupColor, groupTime } = req.body || {}

        // 그룹 존재 확인
        const existingGroup = await groupRepository.findById(id)
        if(!existingGroup) {
            return res.status(404).json({
                message: "존재하지 않는 그룹입니다."
            })
        }

        const updateData = {}

        // 그룹명
        if(groupName !== undefined) {
            if(!groupName.trim()) {
                return res.status(400).json({
                    message: "그룹명을 입력해주세요."
                })
            }

            const duplicateName = await groupRepository.findByGroupNameExcludingId(groupName.trim(), id)
            if(duplicateName) {
                return res.status(409).json({
                    message: "이미 사용 중인 그룹명입니다."
                })
            }

            updateData.groupName = groupName.trim()
        }

        // 그룹 컬러
        if(groupColor !== undefined) {
            if(!groupColor.trim()) {
                return res.status(400).json({
                    message: "그룹 컬러를 입력해주세요."
                })
            }

            const duplicateColor = await groupRepository.findByGroupColorExcludingId(
                groupColor.trim(),
                id
            )
            if(duplicateColor) {
                return res.status(409).json({
                    message: "이미 사용 중인 그룹 컬러입니다."
                })
            }

            updateData.groupColor = groupColor.trim()
        }

        // 그룹 조건 시간
        if(groupTime !== undefined) {
            const time = Number(groupTime)

            if(Number.isNaN(time)) {
                return res.status(400).json({
                    message: "최소 공부시간은 숫자여야합니다."
                })
            }
            if(time < 0) {
                return res.status(400).json({
                    message: "최소 공부시간은 0 이상이어야 합니다."
                })
            }

            const duplicateTime = await groupRepository.findByGroupTimeExcludingId(time, id)
            if(duplicateTime) {
                return res.status(409).json({
                    message: "이미 사용 중인 그룹 조건 시간입니다."
                })
            }

            updateData.groupTime = time
        }

        // 
        if(Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "수정할 내용이 없습니다."
            })
        }

        const updatedGroup = await groupRepository.updateGroupById(id, updateData)

        return res.status(200).json({
            message: "그룹이 수정되었습니다.",
            group: updatedGroup
        })
    } catch(error) {
        console.error("그룹 수정 오류: ", error)

        // unique 인덱스 중복 오류
        if(error.code === 11000) {
            return res.status(409).json({
                message: "그룹명, 그룹 컬러 또는 그룹 조건 시간이 중복되었습니다."
            })
        }

        return res.status(500).json({
            message: "그룹 수정 중 오류가 발생했습니다."
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