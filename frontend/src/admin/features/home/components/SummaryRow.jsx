import SummaryCard from "./SummaryCard.jsx"
import { RiGroupLine } from "react-icons/ri"

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
        </div>
    )
}