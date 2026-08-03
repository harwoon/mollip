import { useEffect, useMemo, useState } from "react"
import Calendar from "react-calendar"
import dayjs from "dayjs"

import { getMonthlyStudyRecords } from "../api/study"
import "react-calendar/dist/Calendar.css"
import styles from "./HitCalendar.module.css"


export default function HitCalendar({
    selectedDate,
    onChangeDate
}){
    // 월간 공부 기록 배열
    const [studyRecords, setStudyRecords] = useState([])

    // API 요청 상태
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // 선택한 날짜 포함된 월
    const selectedMonth = dayjs(selectedDate).format("YYYY-MM")

    // 선택 날짜 월 기록 조회
    useEffect(() => {
        async function fetchMonthlyStudyRecords() {
            try{
                setLoading(true)
                setError("")

                // 백엔드 전달 날짜
                const formattedDate =
                    dayjs(selectedDate).format("YYYY-MM-DD")

                // 히트맵은 월간 기록 사용(항상)
                const data = await getMonthlyStudyRecords(
                    formattedDate
                )

                // API 응답에서 공부 기록 배열 추출
                const records = Array.isArray(data)
                    ? data
                    : data.records
                        ?? data.studyRecords
                        ?? data.studies
                        ?? []

                setStudyRecords(records)

            }catch(error){
                console.error(
                    "월간 공부 기록 조회 오류: ",
                    error
                )

                setError(error.message)
                setStudyRecords([])

            }finally{
                setLoading(false)
            }
        }

        fetchMonthlyStudyRecords()
    }, [selectedMonth])


    // 날짜별 총 공부시간 합산
    const studyTimeByDate = useMemo(() => {
        return studyRecords.reduce((result, record) => {

            // 공부 날짜
            const studyDate =
                record.studyDate ?? record.date

            // 날짜 정보 없으면 제외
            if(!studyDate){
                return result
            }

            // 날짜 형식 통일 YYYY-MM-DD
            const dateKey =
                dayjs(studyDate).format("YYYY-MM-DD")

            const studySeconds = Number(
                record.sumStudyTime
                ?? record.totalStudyTime
                ?? record.studyTime
                ?? 0
            )

            // 숫자가 아닌 값이면 제외
            if(Number.isNaN(studySeconds)){
                return result
            }

            // 같은 날짜에 여러 기록 있으면 '초' 단위로 모두 합산
            result[dateKey] =
                (result[dateKey] ?? 0) + studySeconds

            return result
        }, {})
    }, [studyRecords])

    // 하루 총 공부시간 색상 단계 (minutes 기준)
    function getHeatClass(minutes) {
        if (minutes <= 0) {
            return "heat-level-0"
        }

        // 1시간 미만
        if (minutes < 60) {
            return "heat-level-1"
        }

        // 1시간 이상 3시간 미만
        if (minutes < 180) {
            return "heat-level-2"
        }

        // 3시간 이상 5시간 미만
        if (minutes < 300) {
            return "heat-level-3"
        }

        // 5시간 이상
        return "heat-level-4"
    }

    // 분 단위 값을 시간·분 형식으로 변환
    function formatStudyTime(minutes) {
        if (minutes <= 0) {
            return "공부 기록 없음"
        }

        const totalMinutes = Math.round(minutes)
        const hour = Math.floor(totalMinutes / 60)
        const minute = totalMinutes % 60

        if (hour === 0) {
            return `${minute}분`
        }

        if (minute === 0) {
            return `${hour}시간`
        }

        return `${hour}시간 ${minute}분`
    }

    // react-calendar의 각 날짜 칸에 색상 클래스 적용
    function getTileClassName({ date, view }) {
        // 월간 화면의 날짜 칸에만 적용
        if (view !== "month") {
            return null
        }

        const dateKey =
            dayjs(date).format("YYYY-MM-DD")

        // 해당 날짜의 총 공부시간(초)
        const studySeconds =
            studyTimeByDate[dateKey] ?? 0

        const studyMinutes = Math.floor(studySeconds / 60)

        return getHeatClass(studyMinutes)
    }

    // 날짜 칸에 마우스를 올렸을 때 총 공부시간 표시
    function getTileContent({ date, view }) {
        if (view !== "month") {
            return null
        }

        const dateKey =
            dayjs(date).format("YYYY-MM-DD")

        // 해당 날짜의 총 공부시간(초)
        const studySeconds =
            studyTimeByDate[dateKey] ?? 0

        const studyMinutes = Math.floor(studySeconds / 60)

        return (
            <span
                className={styles.tooltip}
                data-tooltip={`${dateKey} / ${formatStudyTime(studyMinutes)}`}
            />
        )
    }

    // 달력 내부 이전 달·다음 달 버튼 클릭
    function handleMonthChange({
        activeStartDate,
        view
    }) {
        if (view !== "month" || !activeStartDate) {
            return
        }

        const currentMonth =
            dayjs(selectedDate).format("YYYY-MM")

        const changedMonth =
            dayjs(activeStartDate).format("YYYY-MM")

        // 월이 변경된 경우 상위 selectedDate도 변경
        if (currentMonth !== changedMonth) {
            onChangeDate(activeStartDate)
        }
    }


    return (
        <section className={`commonSection ${styles.container}`}>
            <h2 className={styles.title}>일일 집중 시간 히트맵</h2>

            <div className={styles.calendarCard}>
                {loading && (
                    <p className={styles.message}>공부 기록을 불러오는 중입니다.</p>
                )}

                {error && (
                    <p className={styles.error}>{error}</p>
                )}

                <Calendar
                    className={`app-calendar ${styles.calendar}`}
                    value={selectedDate}
                    activeStartDate={
                        dayjs(selectedDate)
                            .startOf("month")
                            .toDate()
                    }
                    onChange={onChangeDate}
                    onActiveStartDateChange={handleMonthChange}
                    tileClassName={getTileClassName}
                    tileContent={getTileContent}
                    formatDay={(locale, date) =>
                        dayjs(date).format("D")
                    }
                    formatMonthYear={(locale, date) =>
                        dayjs(date).format("YYYY년 M월")
                    }
                    calendarType="gregory"
                    next2Label={null}
                    prev2Label={null}
                    showNeighboringMonth={false}
                    minDetail="month"
                    maxDetail="month"
                />

                <div className={styles.legend}>
                    <Legend className="heat-level-0" label="0시간"/>
                    <Legend className="heat-level-1" label="1시간 미만"/>
                    <Legend className="heat-level-2" label="1~3시간"/>
                    <Legend className="heat-level-3" label="3~5시간"/>
                    <Legend className="heat-level-4" label="5시간 이상"/>
                </div>
            </div>
        </section>
    )
}

// 히트맵 색상 범례
function Legend({ className, label }) {
    return (
        <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${className}`}/>
            <span>{label}</span>
        </div>
    )
}