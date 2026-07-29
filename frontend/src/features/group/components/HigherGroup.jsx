import React, { useState, useEffect } from "react"
import {getHigher, getWeekStudyTime} from "../api/group"

import "./group_card.css"

export default function HigherGroup() {
    const [groupName, setGroupName] = useState("")
    const [groupTime, setGroupTime] = useState(0)

    const [remainTime, setRemainTime] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        async function fetchGroupData() {
            try {
                const [higherGroup, weeklyMinutes] = await Promise.all([
                    getHigher(),
                    getWeekStudyTime()
                ])

                setGroupName(higherGroup.groupName)
                setGroupTime(higherGroup.groupTime)

                const higherGroupMinutes = Number(higherGroup.groupTime) || 0

                const myWeeklyMinutes = Number(weeklyMinutes) || 0

                // 상위 그룹까지 남은 시간
                const calculatedRemainTime = Math.max(higherGroupMinutes - myWeeklyMinutes, 0)

                // 진행률
                const calculatedProgress = higherGroupMinutes > 0 ? Math.min(
                    Math.floor(
                        (myWeeklyMinutes / higherGroupMinutes) * 100
                    ), 100
                ) : 0

                setRemainTime(calculatedRemainTime)
                setProgress(calculatedProgress)

            } catch (error) {
                console.error("그룹 데이터 가져오기 실패:", error)
            }
        }
        fetchGroupData()

    }, [])

    const formatMinutes = (minutes) => {

        const totalMinutes = Number(minutes) || 0

        const hours = Math.floor(totalMinutes / 60)
        const remainMinutes = totalMinutes % 60

        if (hours === 0) {
            return `${remainMinutes}분`
        }

        if (remainMinutes === 0) {
            return `${hours}시간`
        }

        return `${hours}시간 ${remainMinutes}분`

    }

    return (
        <div className="groupCard">

            <div className="groupCardHeader">

                <div className="groupCardLeft">

                    <div className="groupCardIcon">
                        <span>▲</span>
                    </div>

                    <div className="groupCardInfo">

                        <p className="groupCardLabel">
                            상위 그룹
                        </p>

                        <h4 className="groupCardName">
                            {groupName}
                        </h4>

                    </div>

                </div>

                <strong
                    className="groupCardTime"
                    style={{ color: "#9ADAB8" }}
                >
                    {formatMinutes(groupTime)}
                </strong>

            </div>

            <div className="groupProgressBox">

                <p className="groupProgressTitle">

                    <span
                        className="groupRemainTime"
                        style={{ color: "#9ADAB8" }}
                    >
                        {formatMinutes(remainTime)}
                    </span>

                    {" "}더 공부하면

                </p>

                <p className="groupProgressMessage">
                    상위 그룹으로 올라갈 수 있어요!
                </p>
{/* 
                <div className="groupProgressArea">

                    <div className="groupProgressBar">

                        <div
                            className="groupProgressValue"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: "#9ADAB8"
                            }}
                        />

                    </div>

                    <span
                        className="groupProgressPercent"
                        style={{ color: "#7652C8" }}
                    >
                        {progress}%
                    </span>

                </div> */}

            </div>

        </div>
    )
}