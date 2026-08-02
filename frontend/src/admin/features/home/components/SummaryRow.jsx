import SummaryCard from "./SummaryCard.jsx"
import { RiGroupLine, RiUserSmileLine, RiCheckboxCircleLine } from "react-icons/ri"

import "./SummaryRow.css"

export default function SummaryRow({ summary }) {
    return (
        <div className="summaryRow">
            <SummaryCard
                icon={<RiGroupLine/>}
                label="운영중인 그룹 수"
                value={summary.groupCount}
                unit="개"
                diff={summary.groupCountDiff}
            />
            <SummaryCard
                icon={<RiUserSmileLine/>}
                label="전체 사용자 수"
                value={summary.userCount}
                unit="명"
                diff={summary.userCountDiff}
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