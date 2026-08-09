import React, { useState, useEffect } from "react"
import { getSubjectRecord } from "../api/user.js"
import styles from "./SubjectRecord.module.css" 


export default function SubjectRecord({ type, start, end, userId }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSubjectData = async () => {
            setLoading(true)
            try {
                const record = await getSubjectRecord(type, start, end, userId)
                setData(record.data || [])

            } catch (error) {
                console.error("과목 공부 조회 실패:", error)
                setData([])
            } finally {
                setLoading(false)
            }
        }

        fetchSubjectData()
    }, [type, start, end, userId])

    if (loading) {
        return (
            <div className="app-modal-state">
                <div className="app-spinner" aria-hidden="true" />
                <p>과목별 공부 기록을 불러오는 중입니다.</p>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="app-empty">
                해당 기간의 과목별 공부 기록이 없습니다.
            </div>
        )
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>
                    <h3>과목별 공부 기록</h3>
                    <p>선택한 기간의 과목별 학습 비중입니다.</p>
                </div>
            </div>

            <div className={styles.list}>
                {data.map((item, index) => {
                    const ratio = Math.round(item.ratio)

                    return (
                        <div
                            key={`${item.subject}-${index}`}
                            className={styles.item}
                        >
                            <span
                                className={styles.colorDot}
                                // GPT 유지 - 과목별 동적 색상은 인라인 style 유지
                                style={{
                                    backgroundColor:
                                        item.subjectColor ||
                                        "#cccccc",
                                }}
                            />

                            <span className={styles.subjectName}>
                                {item.subject}
                            </span>

                            <div className={styles.progressArea}>
                                <div className={styles.progressTrack}>
                                    <span
                                        className={styles.progressBar}
                                        // GPT 유지 - 데이터 비율에 따른 동적 width
                                        style={{
                                            width: `${Math.min(
                                                Math.max(ratio, 0),
                                                100,
                                            )}%`,
                                        }}
                                    />
                                </div>

                                <span className={styles.ratio}>
                                    {ratio}%
                                </span>
                            </div>

                            <span className={styles.studyTime}>
                                {item.studyTime}분
                            </span>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}