import { useEffect, useState } from "react"
import { getMyGroup, getHigher, getWeekStudyTime } from "../api/group"

import "./group_card.css"

export default function MyGroup() {
    const [groupName, setGroupName] = useState("")
    const [groupTime, setGroupTime] = useState(0)
    const [weekStudyTime, setWeekStudyTime] = useState(0)
    const [remainTime, setRemainTime] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const [myGroup, higherGroup, weeklySecondsData] = await Promise.all([
                    getMyGroup(),
                    getHigher(),
                    getWeekStudyTime()
                ])
                
                const myWeeklySeconds = Number(weeklySecondsData) || 0
                const myGroupSeconds = Number(myGroup.groupTime) || 0

                setGroupName(myGroup.groupName)
                setGroupTime(myGroupSeconds)
                setWeekStudyTime(myWeeklySeconds)

                // 최고 그룹이면 상위 그룹이 없음
                if (!higherGroup) {
                    setRemainTime(0)
                    setProgress(100)
                    return
                }

                const higherGroupSeconds = Number(higherGroup.groupTime) || 0

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

            {/* 상단 */}
            <div className="groupCardHeader">
                <div className="groupCardLeft">
                    <div className="groupCardIcon">
                        <span>●</span>
                    </div>

                    <div className="groupCardInfo">

                        <p className="groupCardLabel">
                            내 그룹
                        </p>

                        <h4 className="groupCardName">
                            {groupName || "그룹명 로딩 중..."}
                        </h4>

                    </div>

                </div>
                <strong className="groupConditionTime">
                    {formatStudyTime(groupTime)}
                </strong>

            </div>

            {/* 공부시간 */}
            <div className="groupStudyArea">
                <div className="groupCompareBadge">
                    <span>지난주보다 3시간</span>
                    <span className="groupCompareArrow">▲</span>
                </div>
            </div>

            {/* 진행률 */}
            <div className="groupProgressBox">

                <p className="groupProgressTitle">
                    <span
                        className="groupRemainTime"
                        style={{ color: "#7652C8" }}
                    >
                        {formatStudyTime(remainTime)}
                    </span>
                    {" "}더 공부하면
                </p>

                <p className="groupProgressMessage">
                    상위 그룹으로 올라갈 수 있어요!
                </p>

                <div className="groupProgressArea">

                    <div className="groupProgressBar">
                        <div
                            className="groupProgressValue"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: "#7652C8"
                            }}
                        />
                    </div>

                    <span
                        className="groupProgressPercent"
                        style={{ color: "#7652C8" }}
                    >
                        {progress}%
                    </span>

                </div>

            </div>

        </div>
    )
}