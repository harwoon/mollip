import SummaryCard from "./SummaryCard.jsx"
import { RiGroupLine, RiUserSmileLine, RiCheckboxCircleLine, RiTimeLine } from "react-icons/ri"
import { HiOutlineFire } from "react-icons/hi"

import "./SummaryRow.css"


function formatWeekDiff(
    difference,
    unit,
) {
    const value =
        Number(difference) || 0

    const sign =
        value > 0 ? "+" : ""

    return `${sign}${value}${unit} (전주 대비)`
}
// 초 단위를 시간과 분으로 변경
function formatStudyTime(totalSeconds) {
    const seconds =
        Number(totalSeconds) || 0

    const hours = Math.floor(
        seconds / 3600,
    )

    const minutes = Math.floor(
        (seconds % 3600) / 60,
    )

    if (hours === 0) {
        return `${minutes}분`
    }

    if (minutes === 0) {
        return `${hours.toLocaleString()}시간`
    }

    return `${hours.toLocaleString()}시간 ${minutes}분`
}

function formatStudyTimeDiff(
    diffSeconds,
) {
    const diff =
        Number(diffSeconds) || 0

    if (diff === 0) {
        return "지난주 전체와 동일"
    }

    const sign =
        diff > 0 ? "+" : "-"

    const timeText =
        formatStudyTime(
            Math.abs(diff),
        )

    return (
        `${sign}${timeText} ` +
        `(전주 대비)`
    )
}

export default function SummaryRow({ summary }) {
    return (
        <div className="summaryRow">
            <SummaryCard
                icon={<RiUserSmileLine />}
                label="전체 사용자 수"
                value={
                    summary.totalUserCount
                }
                unit="명"
                diff={formatWeekDiff(
                    summary.userCountDiff,
                    "명",
                )}
            />

            <SummaryCard
                icon={<RiGroupLine />}
                label="운영중인 그룹 수"
                value={summary.groupCount}
                unit="개"
                diff={formatWeekDiff(
                    summary.groupCountDiff,
                    "개",
                )}
            />

            <SummaryCard
                icon={<HiOutlineFire />}
                label="현재 공부 중 인원"
                value={summary.studyingCount}
                unit="명"
                diff={summary.studyingCountNote}
            />

            <SummaryCard
                icon={<RiTimeLine />}
                label="이번 주 이용자 총 공부시간"
                value={formatStudyTime(
                    summary.weeklyTotalTime,
                )}
                unit=""
                diff={formatStudyTimeDiff(
                    summary.weeklyTotalTimeDiff,
                )}
            />

            <SummaryCard
                icon={<RiCheckboxCircleLine />}
                label="이번 주 todo 달성률"
                value={summary.avgGoalRate}
                unit="%"
                diff={summary.avgGoalRateDiff}
            />
        </div>
    )
}