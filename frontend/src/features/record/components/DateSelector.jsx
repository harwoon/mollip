import { useState } from 'react'
import dayjs from 'dayjs'
import Calendar from 'react-calendar'

import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import styles from "./DateSelector.module.css"

export default function DateSelector({ selectedDate, onChangeDate, type }) {
    const [isOpen, setIsOpen] = useState(false)

    const getMoveUnit = () => {
        if (type === "weekly") {
            return "week"
        }

        if (type === "monthly") {
            return "month"
        }

        return "day"
    }

    function getDateLabel(
        selectedDate,
        type,
    ) {
        const target =
            dayjs(selectedDate)

        if (type === "monthly") {
            return target.format("YYYY. MM")
        }

        if (type === "weekly") {
            const dayNumber =
                target.day()

            const differenceToMonday =
                dayNumber === 0
                    ? 6
                    : dayNumber - 1

            const startDate =
                target.subtract(
                    differenceToMonday,
                    "day",
                )

            const endDate =
                startDate.add(6, "day")

            return (
                `${startDate.format(
                    "YYYY. MM. DD",
                )} - ${endDate.format(
                    "MM. DD",
                )}`
            )
        }

        return target.format(
            "YYYY. MM. DD",
        )
    }

    const handlePrev = () => {
        onChangeDate(dayjs(selectedDate).subtract(1, getMoveUnit()).toDate())
    }

    const handleNext = () => {
        onChangeDate(dayjs(selectedDate).add(1, getMoveUnit()).toDate())
    }

    // 달력에서 날짜를 클릭했을 때 실행될 함수
    const handleDateClick = (newDate) => {
        onChangeDate(newDate) // 부모에게 바뀐 날짜 전달
        setIsOpen(false)      // 달력 팝업 닫기
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.selectorBox}>
                <FiCalendar
                    className={styles.calendarIcon}
                    aria-hidden="true"
                />

                <button
                    type="button"
                    className={styles.dateButton}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {getDateLabel(selectedDate, type,)}
                </button>

                <div className={styles.arrowButtons}>
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="이전 날짜"
                    >
                        <FiChevronLeft />
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="다음 날짜"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className={styles.calendarPopup}>
                    <Calendar
                        className="app-calendar"
                        onChange={handleDateClick}
                        value={selectedDate}
                        formatDay={(locale, date) =>
                            dayjs(date).format("D")
                        }
                        calendarType="gregory"
                        next2Label={null}
                        prev2Label={null}
                    />
                </div>
            )}
        </div>
    )
}