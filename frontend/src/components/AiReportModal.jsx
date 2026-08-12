import { useEffect, useState } from "react"
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { RiSparklingFill } from "react-icons/ri"
import DatePicker from "react-datepicker"
import { ko } from "date-fns/locale"
import "react-datepicker/dist/react-datepicker.css"

import { getAiReportStatus, generateAiReport } from "../features/ai/api/ai.js"

import AiSummary from "../features/ai/components/AiSummary.jsx"
import AiLastWeek from "../features/ai/components/AiLastWeek.jsx"
import AiThisWeek from "../features/ai/components/AiThisWeek.jsx"

import styles from "./AiReportModal.module.css"


// 리포트 생성 시각을 "HH:mm" 형태로 표시
function formatReportTime(createdAt) {
    if (!createdAt) return ""

    return new Date(createdAt).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    })
}

// Date 객체를 "YYYY-MM-DD" 문자열로 변환 (서버에 보낼 날짜 값)
function toDateStr(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}


export default function AiReportModal({
    onClose,

    // 오늘 홈 Todo 목록
    todayTodos = [],

    // AI 추천 Todo 추가
    onAddTodo,

    // AI 추천 Todo 제거
    onRemoveTodo
}) {
    // 조회 중인 날짜 (기본값: 오늘)
    const [selectedDate, setSelectedDate] = useState(() => new Date())

    // 선택한 날짜에 생성된 리포트 목록 (오래된 순)
    const [reports, setReports] = useState([])

    // 현재 보고 있는 리포트 인덱스
    const [currentIndex, setCurrentIndex] = useState(-1)

    // 선택한 날짜가 오늘인지 (오늘만 새 리포트 생성 가능)
    const [isToday, setIsToday] = useState(true)

    // 새 리포트를 생성할 수 있는 상태인지 (직전 리포트 이후 3시간 이상 공부했는지)
    const [ready, setReady] = useState(false)

    // 생성 가능 여부 안내 메시지
    const [notice, setNotice] = useState("")

    // 상태 조회 로딩
    const [loading, setLoading] = useState(true)

    // 상태 조회 오류 메시지
    const [error, setError] = useState("")

    // "새 리포트 생성하기" 버튼 처리 상태
    const [generating, setGenerating] = useState(false)

    // 리포트 생성 실패 메시지
    const [generateError, setGenerateError] = useState("")

    const dateStr = toDateStr(selectedDate)


    // 모달이 열리거나 조회 날짜가 바뀌면 해당 날짜의 리포트 상태를 조회 (생성 X)
    useEffect(() => {
        async function fetchStatus() {
            try {
                setLoading(true)
                setError("")

                const data = await getAiReportStatus(dateStr)

                setReports(data.reports)
                setCurrentIndex(data.reports.length - 1)
                setIsToday(data.isToday)
                setReady(data.ready)
                setNotice(data.message || "")

            } catch (err) {
                setError(
                    err.message ||
                    "AI 리포트를 불러오지 못했습니다."
                )

            } finally {
                setLoading(false)
            }
        }

        fetchStatus()
    }, [dateStr])


    // 날짜 선택 변경
    function handleDateChange(date) {
        if (!date) return

        setGenerateError("")
        setSelectedDate(date)
    }


    // "새 리포트 생성하기" 버튼 클릭 (오늘 날짜에서만 노출됨)
    // 서버에서 직전 리포트 이후 3시간이 쌓였는지 다시 확인한 뒤, 조건을 채웠으면 새 리포트를 생성
    async function handleGenerate() {
        try {
            setGenerating(true)
            setGenerateError("")

            const data = await generateAiReport()

            setReports(data.reports)
            // 새로 생성됐으면 방금 만든 리포트로, 아니면 마지막(최신) 리포트로 이동
            setCurrentIndex(data.reports.length - 1)
            setReady(data.ready)
            setNotice(data.message || "")

        } catch (err) {
            setGenerateError(
                err.message ||
                "AI 리포트를 생성하지 못했습니다."
            )

        } finally {
            setGenerating(false)
        }
    }


    // 이전(더 오래된) 리포트로 이동
    function goToPreviousReport() {
        setCurrentIndex((index) => Math.max(0, index - 1))
    }

    // 다음(더 최신) 리포트로 이동
    function goToNextReport() {
        setCurrentIndex((index) => Math.min(reports.length - 1, index + 1))
    }


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


    const currentEntry = reports[currentIndex]
    const currentReport = currentEntry?.reportData

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
                                날짜별 학습 기록을 분석한
                                맞춤형 리포트입니다.
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
                    {/* 조회 날짜 선택 */}
                    <div className={styles.dateBar}>
                        <span className={styles.dateBarLabel}>조회 날짜</span>

                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            locale={ko}
                            dateFormat="yyyy.MM.dd"
                            maxDate={new Date()}
                            popperProps={{ strategy: "fixed" }}
                            customInput={
                                <button type="button" className={styles.dateButton}>
                                    🗓 {dateStr}
                                </button>
                            }
                        />
                    </div>


                    {loading && (
                        <div className="app-modal-state">
                            <div
                                className="app-spinner app-spinner-large"
                                aria-hidden="true"
                            />

                            <strong>
                                AI 리포트 상태를 확인하고 있어요
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


                    {!loading && !error && (
                        <>
                            {/* 생성 가능 여부 안내 + 새 리포트 생성 버튼 - 오늘 날짜에서만 노출 */}
                            {isToday && (
                                <div className={styles.generateBar}>
                                    <p className={styles.generateMessage}>
                                        {notice}
                                    </p>

                                    <button
                                        type="button"
                                        className={`${styles.generateButton} ${
                                            ready ? styles.generateButtonReady : ""
                                        }`}
                                        onClick={handleGenerate}
                                        disabled={generating}
                                    >
                                        {generating
                                            ? "생성 중..."
                                            : "새 리포트 생성하기"}
                                    </button>
                                </div>
                            )}

                            {isToday && generateError && (
                                <p className={styles.generateError}>
                                    {generateError}
                                </p>
                            )}

                            {/* 선택한 날짜에 생성된 리포트가 여러 개면 뒤로가기/앞으로가기로 탐색 */}
                            {reports.length > 0 && (
                                <div className={styles.reportNav}>
                                    <button
                                        type="button"
                                        className={styles.reportNavButton}
                                        onClick={goToPreviousReport}
                                        disabled={currentIndex <= 0}
                                        aria-label="이전 리포트 보기"
                                    >
                                        <FiChevronLeft />
                                    </button>

                                    <span className={styles.reportNavLabel}>
                                        {currentIndex + 1} / {reports.length}
                                        {currentEntry && (
                                            <> · {formatReportTime(currentEntry.createdAt)} 생성</>
                                        )}
                                    </span>

                                    <button
                                        type="button"
                                        className={styles.reportNavButton}
                                        onClick={goToNextReport}
                                        disabled={currentIndex >= reports.length - 1}
                                        aria-label="다음 리포트 보기"
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            )}

                            {currentReport ? (
                                <div className={styles.reportLayout}>
                                    {/* 요약 - 전체 너비 */}
                                    <section className={`${styles.reportCard} ${styles.summaryArea}`}>
                                        <AiSummary
                                            diagnosis={currentReport.diagnosis}
                                        />
                                    </section>

                                    {/* 학습 패턴 4개 - 전체 너비 */}
                                    <section className={`${styles.reportCard} ${styles.patternArea}`}>
                                        <AiLastWeek
                                            patterns={currentReport.patterns}
                                        />
                                    </section>

                                    {/* 아래쪽 2열 영역 */}
                                    <div className={styles.bottomAreas}>
                                        {/* 추천 Todo */}
                                        <section className={`${styles.reportCard} ${styles.todoArea}`}>
                                            <AiThisWeek
                                                recommendations={currentReport.recommendations}
                                                todayTodos={todayTodos}
                                                onAddTodo={onAddTodo}
                                                onRemoveTodo={onRemoveTodo}
                                            />
                                        </section>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.reportCard}>
                                    <p className="aiReportError">
                                        {isToday
                                            ? "아직 오늘 생성된 리포트가 없습니다. 3시간 이상 공부한 뒤 리포트를 생성해보세요."
                                            : "선택한 날짜에 생성된 리포트가 없습니다."}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
