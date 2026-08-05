import { useEffect, useState } from "react"
import { FiX } from "react-icons/fi"
import { RiSparklingFill } from "react-icons/ri"

import { getWeeklyReport } from "../features/ai/api/ai.js"

import AiSummary from "../features/ai/components/AiSummary.jsx"
import AiLastWeek from "../features/ai/components/AiLastWeek.jsx"
import AiThisWeek from "../features/ai/components/AiThisWeek.jsx"
import AiNextWeek from "../features/ai/components/AiNextWeek.jsx"

import styles from "./AiReportModal.module.css"


export default function AiReportModal({
    onClose,

    // 오늘 홈 Todo 목록
    todayTodos = [],

    // AI 추천 Todo 추가
    onAddTodo,

    // AI 추천 Todo 제거
    onRemoveTodo
}) {
    // AI 리포트 데이터
    const [report, setReport] = useState(null)

    // 리포트 생성 상태
    const [loading, setLoading] = useState(true)

    // 오류 메시지
    const [error, setError] = useState("")


    // 모달이 열리면 AI 리포트 조회
    useEffect(() => {
        async function fetchReport() {
            try {
                setLoading(true)
                setError("")

                const data = await getWeeklyReport()

                setReport(data.report)

            } catch (err) {
                setError(
                    err.message ||
                    "AI 리포트를 불러오지 못했습니다."
                )

            } finally {
                setLoading(false)
            }
        }

        fetchReport()
    }, [])


    // ESC 키로 모달 닫기
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        )

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            )
        }
    }, [onClose])


    return (
        <div
            className={styles.overlay}

            // 모달 바깥 영역 클릭 시 닫기
            onMouseDown={onClose}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-report-title"

                // 모달 내부 클릭 시 닫힘 방지
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                {/* 모달 상단 */}
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.titleIcon}>
                            <RiSparklingFill />
                        </div>

                        <div>
                            <h2 id="ai-report-title">
                                AI 학습 리포트
                            </h2>

                            <p>
                                최근 학습 기록을 분석한
                                맞춤형 주간 리포트입니다.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="AI 학습 리포트 닫기"
                    >
                        <FiX />
                    </button>
                </header>


                {/* 모달 본문 */}
                <main className={styles.body}>
                    {loading && (
                        <div className={styles.loading}>
                            <div
                                className={styles.loadingSpinner}
                                aria-hidden="true"
                            />

                            <strong>
                                AI가 학습 기록을 분석하고 있어요
                            </strong>

                            <p>
                                잠시만 기다려 주세요.
                            </p>
                        </div>
                    )}


                    {!loading && error && (
                        <div className={styles.error}>
                            <strong>
                                리포트를 불러오지 못했습니다.
                            </strong>

                            <p>{error}</p>
                        </div>
                    )}


                    {!loading && !error && report && (
                        <div className={styles.reportLayout}>
                            {/* 요약 - 전체 너비 */}
                            <section className={`${styles.reportCard} ${styles.summaryArea}`}>
                                <AiSummary
                                    diagnosis={report.diagnosis}
                                />
                            </section>

                            {/* 학습 패턴 4개 - 전체 너비 */}
                            <section className={`${styles.reportCard} ${styles.patternArea}`}>
                                <AiLastWeek
                                    patterns={report.patterns}
                                />
                            </section>

                            {/* 아래쪽 2열 영역 */}
                            <div className={styles.bottomAreas}>
                                {/* 추천 Todo */}
                                <section className={`${styles.reportCard} ${styles.todoArea}`}>
                                    <AiThisWeek
                                        recommendations={report.recommendations}
                                        todayTodos={todayTodos}
                                        onAddTodo={onAddTodo}
                                        onRemoveTodo={onRemoveTodo}
                                    />
                                </section>

                                {/* 예상 변화 */}
                                {/* <section className={`${styles.reportCard} ${styles.changeArea}`}>
                                    <AiNextWeek
                                        expectedChanges={report.expectedChanges}
                                    />
                                </section> */}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}