import { useState, useEffect } from "react"
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
                const [higherGroup, weeklySecondsData] = await Promise.all([
                    getHigher(),
                    getWeekStudyTime()
                ])

                setGroupName(higherGroup.groupName)
                
                const higherGroupSeconds = Number(higherGroup.groupTime) || 0
                const myWeeklySeconds = Number(weeklySecondsData) || 0

                setGroupTime(higherGroupSeconds)

                const calculatedRemainSeconds = Math.max(higherGroupSeconds - myWeeklySeconds, 0)

                const calculatedProgress = higherGroupSeconds > 0 ? Math.min(
                    Math.floor(
                        (myWeeklySeconds / higherGroupSeconds) * 100
                    ), 100
                ) : 0

                setRemainTime(calculatedRemainSeconds)
                setProgress(calculatedProgress)

            } catch (error) {
                console.error("그룹 데이터 가져오기 실패:", error)
            }
        }
        fetchGroupData()

    }, [])

    const formatStudyTime = (rawSeconds) => {
        const totalSeconds = Number(rawSeconds) || 0
        const totalMinutes = Math.floor(totalSeconds / 60)

        const hours = Math.floor(totalMinutes / 60)
        const remainMinutes = totalMinutes % 60

        if (hours === 0 && remainMinutes === 0) {
            return "0분"
        }
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
                    {formatStudyTime(groupTime)}
                </strong>

            </div>

            <div className="groupProgressBox">

                <p className="groupProgressTitle">

                    <span
                        className="groupRemainTime"
                        style={{ color: "#9ADAB8" }}
                    >
                        {formatStudyTime(remainTime)}
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