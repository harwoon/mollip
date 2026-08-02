import "./SummaryCard.css"

export default function SummaryCard({ icon, label, value, unit, diff }) {
    return (
        <div className="summaryCard">
            <div className="summaryCardIcon">
                {icon}
            </div>
            <div className="summaryCardContent">
                <p className="summaryCardLabel">{label}</p>
                <p className="summaryCardValue">
                    {value}<span className="summaryCardUnit">{unit}</span>
                </p>
                {diff && <p className="summaryCardDiff">수정필요</p>}
            </div>
        </div>
    )
}
