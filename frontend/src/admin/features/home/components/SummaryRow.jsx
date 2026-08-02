import SummaryCard from "./SummaryCard.jsx"
import { RiGroupLine, RiUserSmileLine, RiCheckboxCircleLine } from "react-icons/ri"
import { HiOutlineFire } from "react-icons/hi"

import "./SummaryRow.css"

export default function SummaryRow({ summary }) {
    return (
        <div className="summaryRow">
            <SummaryCard
                icon={<RiUserSmileLine/>}
                label="전체 사용자 수"
                value={summary.totalUserCount}
                unit="명"
                diff={summary}
            />
            <SummaryCard
                icon={<RiGroupLine/>}
                label="운영중인 그룹 수"
                value={summary.groupCount}
                unit="개"
                diff={summary}
            />
            <SummaryCard
                icon={<HiOutlineFire/>}
                label="현재 공부 중 인원"
                value={summary.studyingCount}
                unit="명"
                diff={summary}
            />
            <SummaryCard
                icon={<RiCheckboxCircleLine />}
                label="이번 주 todo 달성률"
                value={summary.avgGoalRate}
                unit="%"
                diff={summary}
            />
        </div>
    )
}