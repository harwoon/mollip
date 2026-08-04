// 서진
// diagnosis.summary: 최근 학습 패턴에 대한 1~2줄 총평
// diagnosis.immersionScore: 몰입도

import { RiSparklingFill } from "react-icons/ri"

export default function AiSummary({ diagnosis }) {

    return (
        <section>
            <div className="aiReportHeader">
                <RiSparklingFill />
                <h3>AI 몰입 코치</h3>
            </div>

            <div>
                <p>오늘의 몰입도</p>
                <p>{diagnosis.immersionScore}%</p>
            </div>

            <div>
                <p>AI 종합 진단</p>
                <p>{diagnosis.summary}</p>
            </div>
        </section>
    )
}