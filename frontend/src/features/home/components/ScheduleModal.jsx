import { useEffect, useMemo, useRef, useState } from "react"
import dayjs from "dayjs"

import AppModal from "../../../components/common/AppModal.jsx"
import AppAlert from "../../../components/common/AppAlert.jsx"
import styles from "./ScheduleModal.module.css"

const PASTEL_COLORS = [
    { name: "연보라", value: "#b19cd9" },
    { name: "연노랑", value: "#fdfd96" },
    { name: "연민트", value: "#b0e0e6" },
    { name: "연하늘", value: "#a2a8d3" },
    { name: "연핑크", value: "#ffb7b2" },
    { name: "연피치", value: "#ffdac1" },
    { name: "연그레이", value: "#e2e2e2" },
]

const MAX_SCHEDULES_PER_DAY = PASTEL_COLORS.length

function getOverlappingSchedules(
    schedules,
    startDate,
    endDate,
    excludedScheduleId,
) {
    if (!startDate || !endDate) return []

    return schedules.filter((schedule) => (
        schedule._id !== excludedScheduleId &&
        schedule.startDate <= endDate &&
        schedule.endDate >= startDate
    ))
}

function findFullScheduleDate(schedules, startDate, endDate) {
    if (!startDate || !endDate || startDate > endDate) return null

    let currentDate = dayjs(startDate)
    const lastDate = dayjs(endDate)

    while (!currentDate.isAfter(lastDate, "day")) {
        const dateKey = currentDate.format("YYYY-MM-DD")
        const scheduleCount = schedules.filter((schedule) => (
            schedule.startDate <= dateKey && schedule.endDate >= dateKey
        )).length

        if (scheduleCount >= MAX_SCHEDULES_PER_DAY) {
            return dateKey
        }

        currentDate = currentDate.add(1, "day")
    }

    return null
}

function parseTimeString(timeStr) {
    if (!timeStr) return { ampm: "오전", hour: "09", minute: "00" }

    const [hStr, mStr] = timeStr.split(":")
    let h = parseInt(hStr, 10)

    if (isNaN(h)) {
        return { ampm: "오전", hour: "09", minute: "00" }
    }

    let ampm = "오전"
    if (h >= 12) {
        ampm = "오후"
        if (h > 12) h -= 12
    }
    if (h === 0) h = 12

    return {
        ampm,
        hour: String(h).padStart(2, "0"),
        minute: mStr || "00",
    }
}

function formatTimeString(ampm, hour, minute) {
    if (!hour || !minute) return ""
    let h = parseInt(hour, 10)
    if (isNaN(h)) return ""

    if (ampm === "오후" && h < 12) h += 12
    if (ampm === "오전" && h === 12) h = 0

    return `${String(h).padStart(2, "0")}:${minute.padStart(2, "0")}`
}

export default function ScheduleModal({
    selectedDate,
    schedules = [],
    allSchedules = [],
    selectedSchedule,
    onSelectSchedule,
    onSave,
    onDelete,
    onClose,
}) {
    const [alertConfig, setAlertConfig] = useState({
        open: false,
        type: "warning",
        title: "",
        message: "",
        showCancel: false,
        confirmText: "확인",
        onConfirm: null,
    })
    function showAlert({
        type = "warning",
        title,
        message = "",
        showCancel = false,
        confirmText = "확인",
        onConfirm = null,
    }) {
        setAlertConfig({
            open: true,
            type,
            title,
            message,
            showCancel,
            confirmText,
            onConfirm,
        })
    }

    function closeAlert() {
        setAlertConfig((prev) => ({
            ...prev,
            open: false,
        }))
    }

    // form 상태에 startDate와 endDate를 추가
    const [form, setForm] = useState({
        title: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        allDay: false,
        memo: "",
        color: "#b19cd9",
    })

    const [startObj, setStartObj] = useState({
        ampm: "오전", hour: "09", minute: "00",
    })

    const [endObj, setEndObj] = useState({
        ampm: "오후", hour: "10", minute: "00",
    })

    const memoRef = useRef(null)

    const overlappingSchedules = useMemo(() => (
        getOverlappingSchedules(
            allSchedules,
            form.startDate,
            form.endDate,
            selectedSchedule?._id,
        )
    ), [allSchedules, form.endDate, form.startDate, selectedSchedule?._id])

    const fullScheduleDate = useMemo(() => (
        findFullScheduleDate(
            overlappingSchedules,
            form.startDate,
            form.endDate,
        )
    ), [form.endDate, form.startDate, overlappingSchedules])

    // 모달이 열릴 때 선택된 날짜를 기본값으로 세팅
    useEffect(() => {
        const defaultDate = dayjs(selectedDate).format("YYYY-MM-DD")

        if (selectedSchedule) {
            setForm({
                title: selectedSchedule.title || "",
                startDate: selectedSchedule.startDate || defaultDate,
                endDate: selectedSchedule.endDate || defaultDate,
                startTime: selectedSchedule.startTime || "",
                endTime: selectedSchedule.endTime || "",
                allDay: selectedSchedule.allDay || false,
                memo: selectedSchedule.memo || "",
                color: selectedSchedule.color || "#b19cd9",
            })

            setStartObj(parseTimeString(selectedSchedule.startTime))
            setEndObj(parseTimeString(selectedSchedule.endTime))
            return
        }

        setForm({
            title: "",
            startDate: defaultDate,
            endDate: defaultDate,
            startTime: "",
            endTime: "",
            allDay: false,
            memo: "",
            color: "#b19cd9",
        })

        setStartObj({ ampm: "오전", hour: "09", minute: "00" })
        setEndObj({ ampm: "오후", hour: "10", minute: "00" })
    }, [selectedSchedule, selectedDate])

    function handleChange(event) {
        const { name, value, type, checked } = event.target
        setForm((previousForm) => ({
            ...previousForm,
            [name]: type === "checkbox" ? checked : value,
        }))

        if (name === "memo" && memoRef.current) {
            memoRef.current.style.height = "auto"
            memoRef.current.style.height = `${memoRef.current.scrollHeight}px`
        }
    }

    function handleStartTimeChange(field, value) {
        const updated = { ...startObj, [field]: value }
        setStartObj(updated)
        const combined = formatTimeString(updated.ampm, updated.hour, updated.minute)
        setForm((prev) => ({ ...prev, startTime: combined }))
    }

    function handleEndTimeChange(field, value) {
        const updated = { ...endObj, [field]: value }
        setEndObj(updated)
        const combined = formatTimeString(updated.ampm, updated.hour, updated.minute)
        setForm((prev) => ({ ...prev, endTime: combined }))
    }

    function handleColorSelect(colorValue) {
        setForm((previousForm) => ({
            ...previousForm,
            color: colorValue,
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (!form.title.trim()) {
            showAlert({
                type: "warning",
                title: "일정 제목을 입력해주세요.",
            })
            return
        }

        if (!form.startDate || !form.endDate) {
            showAlert({
                type: "warning",
                title: "날짜를 확인해주세요.",
                message: "시작일과 종료일을 모두 선택해주세요.",
            })
            return
        }

        if (form.startDate > form.endDate) {
            showAlert({
                type: "warning",
                title: "일정 날짜를 확인해주세요.",
                message: "종료일은 시작일보다 빠를 수 없습니다.",
            })
            return
        }

        if (fullScheduleDate) {
            showAlert({
                type: "warning",
                title: "일정을 더 추가할 수 없습니다.",
                message: `${dayjs(fullScheduleDate).format("YYYY년 M월 D일")}에는 이미 일정이 7개 등록되어 있습니다.`,
            })
            return
        }

        if (!form.color) {
            showAlert({
                type: "warning",
                title: "일정 색상을 확인해주세요.",
                message: "일정 색상을 선택해주세요.",
            })
            return
        }

        const currentStartTime = formatTimeString(
            startObj.ampm,
            startObj.hour,
            startObj.minute
        )

        const currentEndTime = formatTimeString(
            endObj.ampm,
            endObj.hour,
            endObj.minute
        )

        if (
            !form.allDay &&
            form.startDate === form.endDate &&
            currentStartTime >= currentEndTime
        ) {
            showAlert({
                type: "warning",
                title: "일정 시간을 확인해주세요.",
                message: "종료 시간은 시작 시간보다 늦어야 합니다.",
            })
            return
        }

        const scheduleData = {
            ...form,
            title: form.title.trim(),
            startTime: form.allDay ? "" : currentStartTime,
            endTime: form.allDay ? "" : currentEndTime,
        }

        await onSave(scheduleData)
    }

function handleDelete() {
    if (!selectedSchedule) return

    showAlert({
        type: "danger",
        title: "일정을 삭제하시겠어요?",
        message: "삭제된 일정은 복구할 수 없습니다.",
        showCancel: true,
        confirmText: "삭제",

        onConfirm: async () => {
            closeAlert()

            await onDelete(selectedSchedule._id)
        },
    })
}

function handleNewSchedule() {
    const defaultDate = dayjs(selectedDate).format("YYYY-MM-DD")

    const schedulesOnSelectedDate = getOverlappingSchedules(
        allSchedules,
        defaultDate,
        defaultDate,
        null,
    )

    if (schedulesOnSelectedDate.length >= MAX_SCHEDULES_PER_DAY) {
        showAlert({
            type: "warning",
            title: "일정을 더 추가할 수 없습니다.",
            message: "하루에 등록할 수 있는 일정은 최대 7개입니다.",
        })
        return
    }

    onSelectSchedule(null)
    setForm({
        title: "",
        startDate: defaultDate,
        endDate: defaultDate,
        startTime: "",
        endTime: "",
        allDay: false,
        memo: "",
        color: "#b19cd9",
    })
    setStartObj({ ampm: "오전", hour: "09", minute: "00" })
    setEndObj({ ampm: "오후", hour: "10", minute: "00" })
}

return (
    <>
        <AppModal
            open={true}
            type="action"
            title={selectedSchedule ? "일정 수정" : "일정 추가"}
            description={
                form.startDate
                    ? dayjs(form.startDate).format("YYYY년 M월 D일")
                    : "일정 정보를 입력해주세요."
            }
            onClose={onClose}
        >
            <div
                style={{
                    "--theme-color": form.color,
                }}
            >
                <form
                    className={styles.scheduleForm}
                    onSubmit={handleSubmit}
                >
                    <label>
                        일정 제목
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="일정 제목을 입력하세요"
                            maxLength={50}
                        />
                    </label>

                    <label className={styles.scheduleCheckbox}>
                        <input
                            type="checkbox"
                            name="allDay"
                            checked={form.allDay}
                            onChange={handleChange}
                        />
                        종일 일정
                    </label>

                    {/* 시작일 / 종료일 / 시간 */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "15px",
                        }}
                    >
                        <label style={{ flex: 1 }}>
                            시작

                            <div
                                style={{
                                    display: "flex",
                                    gap: "5px",
                                    marginTop: "6px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    style={{
                                        padding: "6px",
                                        borderRadius: "4px",
                                        border: "1px solid #ddd",
                                        fontSize: "14px",
                                    }}
                                />

                                {!form.allDay && (
                                    <>
                                        <select
                                            value={startObj.ampm}
                                            onChange={(e) =>
                                                handleStartTimeChange(
                                                    "ampm",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="오전">
                                                오전
                                            </option>

                                            <option value="오후">
                                                오후
                                            </option>
                                        </select>

                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={startObj.hour}
                                            onChange={(e) =>
                                                handleStartTimeChange(
                                                    "hour",
                                                    e.target.value
                                                )
                                            }
                                            style={{
                                                width: "50px",
                                                textAlign: "center",
                                            }}
                                        />

                                        <span
                                            style={{
                                                alignSelf: "center",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            :
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={startObj.minute}
                                            onChange={(e) =>
                                                handleStartTimeChange(
                                                    "minute",
                                                    e.target.value
                                                )
                                            }
                                            style={{
                                                width: "50px",
                                                textAlign: "center",
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        </label>

                        <label style={{ flex: 1 }}>
                            종료

                            <div
                                style={{
                                    display: "flex",
                                    gap: "5px",
                                    marginTop: "6px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                    style={{
                                        padding: "6px",
                                        borderRadius: "4px",
                                        border: "1px solid #ddd",
                                        fontSize: "14px",
                                    }}
                                />

                                {!form.allDay && (
                                    <>
                                        <select
                                            value={endObj.ampm}
                                            onChange={(e) =>
                                                handleEndTimeChange(
                                                    "ampm",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="오전">
                                                오전
                                            </option>

                                            <option value="오후">
                                                오후
                                            </option>
                                        </select>

                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={endObj.hour}
                                            onChange={(e) =>
                                                handleEndTimeChange(
                                                    "hour",
                                                    e.target.value
                                                )
                                            }
                                            style={{
                                                width: "50px",
                                                textAlign: "center",
                                            }}
                                        />

                                        <span
                                            style={{
                                                alignSelf: "center",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            :
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={endObj.minute}
                                            onChange={(e) =>
                                                handleEndTimeChange(
                                                    "minute",
                                                    e.target.value
                                                )
                                            }
                                            style={{
                                                width: "50px",
                                                textAlign: "center",
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* 일정 색상 */}
                    <label>
                        일정 색상

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "8px",
                                alignItems: "center",
                            }}
                        >
                            {PASTEL_COLORS.map((item) => {
                                const isSelected =
                                    form.color === item.value
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        title={item.name}
                                        onClick={() =>
                                            handleColorSelect(
                                                item.value
                                            )
                                        }
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "50%",
                                            backgroundColor:
                                                item.value,
                                            border: isSelected
                                                ? "3px solid #333"
                                                : "1px solid #ddd",
                                            cursor: "pointer",
                                            transform: isSelected
                                                ? "scale(1.15)"
                                                : "scale(1)",
                                            transition:
                                                "all 0.2s ease",
                                        }}
                                    />
                                )
                            })}
                        </div>
                    </label>

                    {/* 메모 */}
                    <label>
                        메모

                        <textarea
                            ref={memoRef}
                            name="memo"
                            value={form.memo}
                            onChange={handleChange}
                            placeholder="메모를 입력하세요"
                            maxLength={500}
                        />
                    </label>

                    {/* 하단 버튼 */}
                    <div
                        className={
                            styles.scheduleModalActions
                        }
                    >
                        {selectedSchedule && (
                            <button
                                type="button"
                                className="app-btn-danger"
                                onClick={handleDelete}
                            >
                                삭제
                            </button>
                        )}

                        <div
                            className={
                                styles.scheduleActionRight
                            }
                        >
                            <button
                                type="button"
                                className="app-btn-secondary"
                                onClick={onClose}
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="app-btn-primary"
                            >
                                {selectedSchedule
                                    ? "수정"
                                    : "등록"}
                            </button>
                        </div>
                    </div>
                </form>

                {/* 등록된 일정 목록 */}
                <section
                    className={
                        styles.scheduleListSection
                    }
                    style={{
                        marginTop: "20px",
                        borderTop: "1px solid #eee",
                        paddingTop: "15px",
                    }}
                >
                    <div
                        className={
                            styles.scheduleListHeader
                        }
                    >
                        <h3>등록된 일정</h3>

                        {selectedSchedule ? (
                            <button
                                type="button"
                                className="app-btn-link"
                                onClick={handleNewSchedule}
                            >
                                + 새 일정 작성
                            </button>
                        ) : (
                            <span
                                style={{
                                    fontSize: "13px",
                                    color: "#888",
                                }}
                            >
                                작성 중
                            </span>
                        )}
                    </div>

                    {schedules.length === 0 ? (
                        <p
                            className={
                                styles.scheduleEmpty
                            }
                        >
                            이날 등록된 일정이 없습니다.
                        </p>
                    ) : (
                        <div
                            className={
                                styles.scheduleList
                            }
                        >
                            {schedules.map(
                                (schedule) => (
                                    <button
                                        type="button"
                                        key={
                                            schedule._id
                                        }
                                        className={`${styles.scheduleListItem} ${selectedSchedule?._id ===
                                                schedule._id
                                                ? styles.selected
                                                : ""
                                            }`}
                                        onClick={() =>
                                            onSelectSchedule(
                                                schedule
                                            )
                                        }
                                    >
                                        <span
                                            className={
                                                styles.scheduleColor
                                            }
                                            style={{
                                                backgroundColor:
                                                    schedule.color,
                                            }}
                                        />

                                        <span>
                                            {schedule.allDay
                                                ? "종일"
                                                : schedule.startTime ||
                                                "시간 없음"}
                                        </span>

                                        <strong>
                                            {
                                                schedule.title
                                            }
                                        </strong>
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>
        </AppModal>

        <AppAlert
            open={alertConfig.open}
            type={alertConfig.type}
            title={alertConfig.title}
            message={alertConfig.message}
            showCancel={alertConfig.showCancel}
            confirmText={alertConfig.confirmText}
            onCancel={closeAlert}
            onClose={closeAlert}
            onConfirm={() => {
                if (alertConfig.onConfirm) {
                    alertConfig.onConfirm()
                    return
                }

                closeAlert()
            }}
        />
    </>
)
}
