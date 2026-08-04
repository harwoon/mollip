// 서진
// diagnosis.summary: 최근 학습 패턴에 대한 1~2줄 총평
// diagnosis.immersionScore: 몰입도

export default function AiSummary({ diagnosis }) {
    return (
        <>
            <div>AiSummary</div>
            <div>{diagnosis.summary}</div>
            <div>{diagnosis.immersionScore}</div>
        </>
    )
}