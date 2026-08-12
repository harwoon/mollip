import { useState, useEffect, useMemo, useCallback } from 'react'
import Calendar from 'react-calendar'
import dayjs from 'dayjs'
import styles from './HomeCalendar.module.css'
import ScheduleModal from "./ScheduleModal.jsx"
import AppAlert from "../../../components/common/AppAlert.jsx"

import { getSchedules, addSchedule, updateSchedule, deleteSchedule } from '../api/schedule.js'
import { createPortal } from 'react-dom'


export default function HomeCalendar() {
  const [hoveredSchedule, setHoveredSchedule] = useState(null)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeMonth, setActiveMonth] = useState(new Date())
  const [schedules, setSchedules] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [error, setError] = useState("")

  // 일정 저장, 삭제 성공·실패 메시지용 공통 Alert 상태
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
  })

  const fetchSchedules = useCallback(async () => {
    try {
      setError("")
      const startDate = dayjs(activeMonth).startOf("month").format("YYYY-MM-DD")
      const endDate = dayjs(activeMonth).endOf("month").format("YYYY-MM-DD")
      const data = await getSchedules(startDate, endDate)
      setSchedules(Array.isArray(data) ? data : data.schedules || [])
    } catch (error) {
      console.error("일정 조회 실패:", error)
      setError(error.message)
    }
  }, [activeMonth])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  // 일정 알람 로직
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
    }

    const alarmTimer = setInterval(() => {
      const now = dayjs()
      const nowDate = now.format("YYYY-MM-DD")
      const nowTime = now.format("HH:mm")

      const storageKey = `notified_schedules_${nowDate}`
      const firedSchedules = JSON.parse(localStorage.getItem(storageKey) || "[]")

      schedules.forEach((schedule) => {
        if (
          !schedule.allDay &&
          schedule.startDate === nowDate &&
          schedule.startTime === nowTime &&
          !firedSchedules.includes(schedule._id)
        ) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Mollip 일정 알림 🔔", {
              body: `[${schedule.title}] 일정이 지금 시작됩니다!`,
            })

            firedSchedules.push(schedule._id)
            localStorage.setItem(storageKey, JSON.stringify(firedSchedules))
          }
        }
      })
    }, 60000)

    return () => clearInterval(alarmTimer)
  }, [schedules])

  const schedulesByDate = useMemo(() => {
    const result = {}

    const sortedSchedules = [...schedules].sort((a, b) => {
      const durationA = dayjs(a.endDate).diff(dayjs(a.startDate), 'day')
      const durationB = dayjs(b.endDate).diff(dayjs(b.startDate), 'day')
      return durationB - durationA
    })

    sortedSchedules.forEach((schedule) => {
      const start = dayjs(schedule.startDate)
      const end = dayjs(schedule.endDate)
      const diffDays = Math.max(0, end.diff(start, 'day'))

      for (let i = 0; i <= diffDays; i++) {
        const dateKey = start.add(i, 'day').format("YYYY-MM-DD")

        if (!result[dateKey]) {
          result[dateKey] = []
        }

        result[dateKey].push({
          ...schedule,
          isStart: i === 0,
          isEnd: i === diffDays
        })
      }
    })

    return result
  }, [schedules])

  async function handleSaveSchedule(scheduleData) {
    const isEditing = Boolean(selectedSchedule?._id)
    try {
      setError("")
      const payload = {
        ...scheduleData,
        allDay: scheduleData.allDay ?? false,
        startTime: scheduleData.startTime || "09:00" 
      }

      if (selectedSchedule?._id) {
        await updateSchedule(selectedSchedule._id, payload)
      } else {
        await addSchedule(payload)
      }
      await fetchSchedules()
      setSelectedSchedule(null)
      setIsModalOpen(false)

      // 공통 success Alert
      setAlertConfig({
        open: true,
        type: "success",
        title: isEditing ? "일정 수정 완료" : "일정 추가 완료",
        message: isEditing ? "일정이 수정되었습니다." : "새 일정이 추가되었습니다.",
      })

    } catch (error) {
      console.error("일정 저장 실패:", error)
      setError(error.message)
      
      // 공통 danger Alert
      setAlertConfig({
        open: true,
        type: "danger",
        title: "일정 저장 실패",
        message: error.message || "일정을 저장하지 못했습니다.",
      })
    }
  }

  async function handleDeleteSchedule(scheduleId) {
    try {
      setError("")
      await deleteSchedule(scheduleId)
      await fetchSchedules()
      setSelectedSchedule(null)
      setIsModalOpen(false)

      //실제 삭제 성공 후 공통 success Alert 표시
      setAlertConfig({
        open: true,
        type: "success",
        title: "일정 삭제 완료",
        message: "일정이 삭제되었습니다.",
      })

    } catch (error) {
      console.error("일정 삭제 실패:", error)
      setError(error.message)
      
      // 공통 danger Alert
      setAlertConfig({
        open: true,
        type: "danger",
        title: "일정 삭제 실패",
        message: error.message || "일정을 삭제하지 못했습니다.",
      })
    }
  }

  return (
    <div className={styles.homeCalendarCard}>
      {error && <p className={styles.scheduleError}>{error}</p>}

      <Calendar
        className={`app-calendar ${styles.customCalendar}`}
        onChange={setSelectedDate}
        value={selectedDate}
        calendarType="gregory"
        formatDay={(locale, date) => dayjs(date).format("D")}
        next2Label={null}
        prev2Label={null}
        showNeighboringMonth={false}
        onActiveStartDateChange={({ activeStartDate }) => {
          setActiveMonth(activeStartDate)
        }}
        onClickDay={(value) => {
          setSelectedDate(value)
          setSelectedSchedule(null)
          setIsModalOpen(true)
        }}
        tileContent={({ date, view }) => {
          if (view !== "month") return null

          const dateKey = dayjs(date).format("YYYY-MM-DD")
          const daySchedules = schedulesByDate[dateKey] || []
          const dayNum = dayjs(date).date()
          const isSelected = selectedDate && dayjs(selectedDate).format("YYYY-MM-DD") === dateKey

          return (
            <div
              className={styles.calendarCustomTileContent}
              onMouseEnter={(event) => {
                if (daySchedules.length === 0) return
                const rect = event.currentTarget.getBoundingClientRect()
                
                setHoveredSchedule({
                  schedules: daySchedules,
                  top: rect.bottom + 4,
                  left: rect.left,
                })
              }}
              onMouseLeave={() => {
                setHoveredSchedule(null)
              }}
            >
              <div className={`${styles.customTileNumber} ${isSelected ? styles.isSelected : ''}`}>
                {dayNum}
              </div>

              <div className={styles.calendarSchedulePreview}>
                {daySchedules
                  .slice(0, 2)
                  .map((schedule) => (
                    <div
                      key={schedule._id}
                      className={`${styles.calendarScheduleItem} ${schedule.isStart ? styles.isStart : ''} ${schedule.isEnd ? styles.isEnd : ''}`}
                      style={{ "--bgColor": schedule.color || "#b19cd9" }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDate(new Date(schedule.startDate))
                        setSelectedSchedule(schedule)
                        setIsModalOpen(true)
                      }}
                    />
                  ))}

                {daySchedules.length > 2 && (
                  <span className={styles.calendarScheduleMore}>
                    +{daySchedules.length - 2}
                  </span>
                )}
              </div>
            </div>
          )
        }}
      />

      {isModalOpen && (
        <ScheduleModal
          selectedDate={selectedDate}
          schedules={schedulesByDate[dayjs(selectedDate).format("YYYY-MM-DD")] || []}
          allSchedules={schedules}
          selectedSchedule={selectedSchedule}
          onSelectSchedule={setSelectedSchedule}
          onSave={handleSaveSchedule}
          onDelete={handleDeleteSchedule}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedSchedule(null)
          }}
        />
      )}

      {hoveredSchedule &&
        createPortal(
          <div
            className={styles.calendarScheduleTooltip}
            style={{
              top: hoveredSchedule.top,
              left: hoveredSchedule.left,
            }}
          >
            {hoveredSchedule.schedules.map((schedule, idx) => {
              const timeStr = schedule.allDay ? "" : `${schedule.startTime || "09:00"} `
              return (
                <div 
                  key={idx} 
                  className={styles.tooltipItem}
                  style={{ color: schedule.color || "#b19cd9" }}
                >
                  • {timeStr}{schedule.title}
                </div>
              )
            })}
          </div>,
          document.body,
        )}

        {/* 공통 AppAlert */}
        <AppAlert
          open={alertConfig.open}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onConfirm={() => setAlertConfig((previous) => ({ ...previous, open: false }))}
          onClose={() => setAlertConfig((previous) => ({ ...previous, open: false }))}
        />
    </div>
  )
}
