import { useEffect, useState, useMemo, useCallback } from "react"
import dayjs from "dayjs"

import "./ScheduleModal.css"

const initialForm = {
    title: "",
    startTime: "",
    endTime: "",
    allDay: false,
    memo: "",
    color: "#7c83fd",
}

export default function ScheduleModal({
    selectedDate,
    schedules = [],
    selectedSchedule,
    onSelectSchedule,
    onSave,
    onDelete,
    onClose,
}) {
    const [form, setForm] =
        useState(initialForm)

    // 수정할 일정을 선택하면 기존 내용을 입력창에 표시
    useEffect(() => {
        if (selectedSchedule) {
            setForm({
                title:
                    selectedSchedule.title || "",
                startTime:
                    selectedSchedule.startTime ||
                    "",
                endTime:
                    selectedSchedule.endTime ||
                    "",
                allDay:
                    selectedSchedule.allDay ||
                    false,
                memo:
                    selectedSchedule.memo || "",
                color:
                    selectedSchedule.color ||
                    "#7c83fd",
            })

            return
        }

        // 새 일정 작성 상태
        setForm(initialForm)
    }, [selectedSchedule, selectedDate])

    function handleChange(event) {
        const {
            name,
            value,
            type,
            checked,
        } = event.target

        setForm((previousForm) => ({
            ...previousForm,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (!form.title.trim()) {
            alert("일정 제목을 입력해주세요.")
            return
        }

        if (
            !form.allDay &&
            form.startTime &&
            form.endTime &&
            form.startTime >= form.endTime
        ) {
            alert(
                "종료 시간은 시작 시간보다 늦어야 합니다.",
            )
            return
        }

        const scheduleData = {
            ...form,
            title: form.title.trim(),
            scheduleDate:
                dayjs(selectedDate).format(
                    "YYYY-MM-DD",
                ),

            // 종일 일정이면 시간은 빈 문자열로 저장
            startTime: form.allDay
                ? ""
                : form.startTime,

            endTime: form.allDay
                ? ""
                : form.endTime,
        }

        await onSave(scheduleData)
    }

    async function handleDelete() {
        if (!selectedSchedule) {
            return
        }

        const isConfirmed = window.confirm(
            "이 일정을 삭제하시겠습니까?",
        )

        if (!isConfirmed) {
            return
        }

        await onDelete(selectedSchedule._id)
    }

    function handleNewSchedule() {
        onSelectSchedule(null)
        setForm(initialForm)
    }

    return (
        <div
            className="schedule-modal-overlay"
            onClick={onClose}
        >
            <div
                className="schedule-modal"
                onClick={(event) => {
                    event.stopPropagation()
                }}
            >
                <div className="schedule-modal-header">
                    <h2>
                        {dayjs(selectedDate).format(
                            "YYYY년 M월 D일",
                        )}
                    </h2>

                    <button
                        type="button"
                        className="schedule-modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <section className="schedule-list-section">
                    <div className="schedule-list-header">
                        <h3>등록된 일정</h3>

                        <button
                            type="button"
                            onClick={
                                handleNewSchedule
                            }
                        >
                            새 일정
                        </button>
                    </div>

                    {schedules.length === 0 ? (
                        <p className="schedule-empty">
                            등록된 일정이 없습니다.
                        </p>
                    ) : (
                        <div className="schedule-list">
                            {schedules.map(
                                (schedule) => (
                                    <button
                                        type="button"
                                        key={
                                            schedule._id
                                        }
                                        className={
                                            selectedSchedule?._id ===
                                                schedule._id
                                                ? "schedule-list-item selected"
                                                : "schedule-list-item"
                                        }
                                        onClick={() => {
                                            onSelectSchedule(
                                                schedule,
                                            )
                                        }}
                                    >
                                        <span
                                            className="schedule-color"
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
                                ),
                            )}
                        </div>
                    )}
                </section>

                <form
                    className="schedule-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        일정 제목

                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={
                                handleChange
                            }
                            placeholder="일정 제목을 입력하세요"
                            maxLength={50}
                        />
                    </label>

                    <label className="schedule-checkbox">
                        <input
                            type="checkbox"
                            name="allDay"
                            checked={form.allDay}
                            onChange={
                                handleChange
                            }
                        />

                        종일 일정
                    </label>

                    {!form.allDay && (
                        <div className="schedule-time-row">
                            <label>
                                시작 시간

                                <input
                                    type="time"
                                    name="startTime"
                                    value={
                                        form.startTime
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </label>

                            <label>
                                종료 시간

                                <input
                                    type="time"
                                    name="endTime"
                                    value={
                                        form.endTime
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </label>
                        </div>
                    )}

                    <label>
                        일정 색상

                        <div className="schedule-color-field">
                            <input
                                type="color"
                                name="color"
                                className="schedule-color-input"
                                value={form.color}
                                onChange={handleChange}
                            />

                            <span className="schedule-color-code">
                                {form.color}
                            </span>
                        </div>
                    </label>

                    <label>
                        메모

                        <textarea
                            name="memo"
                            value={form.memo}
                            onChange={
                                handleChange
                            }
                            placeholder="메모를 입력하세요"
                            maxLength={500}
                        />
                    </label>

                    <div className="schedule-modal-actions">
                        {selectedSchedule && (
                            <button
                                type="button"
                                className="schedule-delete-button"
                                onClick={
                                    handleDelete
                                }
                            >
                                삭제
                            </button>
                        )}

                        <div className="schedule-action-right">
                            <button
                                type="button"
                                onClick={onClose}
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="schedule-save-button"
                            >
                                {selectedSchedule
                                    ? "수정"
                                    : "등록"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}