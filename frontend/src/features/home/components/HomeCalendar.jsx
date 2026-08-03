import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Calendar from 'react-calendar'
import dayjs from 'dayjs'
import './HomeCalendar.css'
import ScheduleModal from "./ScheduleModal.jsx"
import { getSchedules, addSchedule, updateSchedule, deleteSchedule } from '../api/schedule.js'
import { createPortal } from 'react-dom'

export default function HomeCalendar() {
  const [hoveredSchedule, setHoveredSchedule] =
    useState(null)

  const [selectedDate, setSelectedDate] =
    useState(new Date())

  const [activeMonth, setActiveMonth] =
    useState(new Date())

  const [schedules, setSchedules] =
    useState([])

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [
    selectedSchedule,
    setSelectedSchedule,
  ] = useState(null)

  const [error, setError] =
    useState("")

  // 현재 화면에 표시 중인 월의 일정 조회
  const fetchSchedules =
    useCallback(async () => {
      try {
        setError("")

        const startDate =
          dayjs(activeMonth)
            .startOf("month")
            .format("YYYY-MM-DD")

        const endDate =
          dayjs(activeMonth)
            .endOf("month")
            .format("YYYY-MM-DD")

        const data =
          await getSchedules(
            startDate,
            endDate,
          )

        // 백엔드가 { schedules: [] }로 반환한다고 가정
        setSchedules(
          Array.isArray(data)
            ? data
            : data.schedules || [],
        )
      } catch (error) {
        console.error(
          "일정 조회 실패:",
          error,
        )

        setError(error.message)
      }
    }, [activeMonth])

  // 처음 화면이 열리거나 월이 바뀌면 일정 조회
  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  // 일정들을 날짜별로 묶기
  const schedulesByDate =
    useMemo(() => {
      return schedules.reduce(
        (result, schedule) => {
          const dateKey =
            schedule.scheduleDate

          if (!result[dateKey]) {
            result[dateKey] = []
          }

          result[dateKey].push(
            schedule,
          )

          return result
        },
        {},
      )
    }, [schedules])

  // 일정 등록 또는 수정
  async function handleSaveSchedule(
    scheduleData,
  ) {
    try {
      setError("")

      // 선택한 기존 일정이 있으면 수정
      if (selectedSchedule?._id) {
        await updateSchedule(
          selectedSchedule._id,
          scheduleData,
        )
      } else {
        // 선택한 기존 일정이 없으면 새로 등록
        await addSchedule(
          scheduleData,
        )
      }

      // 저장 후 현재 월 일정 다시 조회
      await fetchSchedules()

      setSelectedSchedule(null)
      setIsModalOpen(false)
    } catch (error) {
      console.error(
        "일정 저장 실패:",
        error,
      )

      setError(error.message)
      alert(
        error.message ||
        "일정을 저장하지 못했습니다.",
      )
    }
  }

  // 일정 삭제
  async function handleDeleteSchedule(
    scheduleId,
  ) {
    try {
      setError("")

      await deleteSchedule(scheduleId)

      // 삭제 후 현재 월 일정 다시 조회
      await fetchSchedules()

      setSelectedSchedule(null)
    } catch (error) {
      console.error(
        "일정 삭제 실패:",
        error,
      )

      setError(error.message)
      alert(
        error.message ||
        "일정을 삭제하지 못했습니다.",
      )
    }
  }

  return (
    <div className="calendar-container">
      {error && (
        <p className="schedule-error">
          {error}
        </p>
      )}

      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}

        onClickDay={(clickedDate) => {
          setSelectedDate(
            clickedDate,
          )

          setSelectedSchedule(null)
          setIsModalOpen(true)
        }}

        onActiveStartDateChange={({
          activeStartDate,
        }) => {
          setActiveMonth(
            activeStartDate,
          )
        }}

        tileContent={({ date, view }) => {
          if (view !== "month") {
            return null
          }

          const dateKey =
            dayjs(date).format("YYYY-MM-DD")

          const daySchedules =
            schedulesByDate[dateKey] || []

          if (daySchedules.length === 0) {
            return null
          }


          return (
            <div className="calendar-schedule-preview">
              {daySchedules
                .slice(0, 2)
                .map((schedule) => (
                  <div
                    key={schedule._id}
                    className="calendar-schedule-item"
                  >
                    <span
                      className="calendar-schedule-dot"
                      style={{
                        backgroundColor:
                          schedule.color ||
                          "#7c83fd",
                      }}
                    />

                    <span
                      className="calendar-schedule-title"
                      onMouseEnter={(event) => {
                        const rect =
                          event.currentTarget.getBoundingClientRect()

                        setHoveredSchedule({
                          text: `${schedule.allDay
                            ? ""
                            : schedule.startTime
                              ? `${schedule.startTime} `
                              : ""
                            }${schedule.title}`,

                          top: rect.bottom + 6,
                          left: rect.left,
                        })
                      }}
                      onMouseLeave={() => {
                        setHoveredSchedule(null)
                      }}
                    >
                      {schedule.allDay
                        ? ""
                        : schedule.startTime
                          ? `${schedule.startTime} `
                          : ""}

                      {schedule.title}
                    </span>
                  </div>
                ))}

              {daySchedules.length > 2 && (
                <span className="calendar-schedule-more">
                  +{daySchedules.length - 2}
                </span>
              )}
            </div>
          )
        }}

        formatDay={(
          locale,
          date,
        ) =>
          dayjs(date).format("D")
        }

        next2Label={null}
        prev2Label={null}
        showNeighboringMonth={false}
      />

      {isModalOpen && (
        <ScheduleModal
          selectedDate={
            selectedDate
          }
          schedules={
            schedulesByDate[
            dayjs(
              selectedDate,
            ).format(
              "YYYY-MM-DD",
            )
            ] || []
          }
          selectedSchedule={
            selectedSchedule
          }
          onSelectSchedule={
            setSelectedSchedule
          }
          onSave={
            handleSaveSchedule
          }
          onDelete={
            handleDeleteSchedule
          }
          onClose={() => {
            setIsModalOpen(false)
            setSelectedSchedule(
              null,
            )
          }}
        />
      )}

      {hoveredSchedule &&
        createPortal(
          <div
            className="calendar-schedule-tooltip"
            style={{
              top: hoveredSchedule.top,
              left: hoveredSchedule.left,
            }}
          >
            {hoveredSchedule.text}
          </div>,
          document.body,
        )}
    </div>
  )
}