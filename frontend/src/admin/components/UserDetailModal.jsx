import React, { useState } from "react"
import "./UserDetailModal.css"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import dayjs from "dayjs"

import UserDetailInfo from "../features/user/components/UserDetailInfo"
import SubjectRecord from "../features/user/components/SubjectRecord"
import TotalStudy from "../features/user/components/TotalStudy"

export default function UserDetailModal({ user, onClose }) {
    const [type, setType] = useState("daily")

    const today = new Date()
    const lastWeek = new Date()
    lastWeek.setDate(today.getDate() - 7)

    const [dateRange, setDateRange] = useState([lastWeek, today])
    const [startDate, endDate] = dateRange

    const isValidRange = (targetType, start, end) => {
        if (!start || !end) return true

        const diffDays = dayjs(end).diff(dayjs(start), "day")
        const diffMonths = dayjs(end).diff(dayjs(start), "month", true)

        if (targetType === "daily" && diffDays > 14) {
            alert("일간 조회는 최대 14일까지만 가능합니다.")
            return false;
        }
        if (targetType === "weekly" && diffMonths > 3) {
            alert("주간 조회는 최대 3개월까지만 가능합니다.")
            return false
        }

        return true
    }

    const handleTypeChange = (newType) => {
        if (isValidRange(newType, startDate, endDate)) {
            setType(newType);
        }
    }

    const handleDateChange = (update) => {
        const [newStart, newEnd] = update;
        // 새로 선택하려는 달력 기간이 현재 타입의 제한을 넘지 않을 때만 상태 변경
        if (isValidRange(type, newStart, newEnd)) {
            setDateRange(update);
        }
    }

    if (!user) return null
    const formattedStartDate = startDate ? dayjs(startDate).format("YYYY-MM-DD") : ""
    const formattedEndDate = endDate ? dayjs(endDate).format("YYYY-MM-DD") : ""

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "#fff",
                    padding: "30px",
                    borderRadius: "10px",
                    width: "80%",
                    maxWidth: "800px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                    <h2 style={{ margin: 0 }}>회원 상세</h2>
                    <button type="button" onClick={onClose} style={{ cursor: "pointer", padding: "5px 10px" }}>✕ 닫기</button>
                </div>

                <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                        <button
                            type="button"
                            onClick={() => handleTypeChange("daily")} 
                            style={{ fontWeight: type === "daily" ? "bold" : "normal" }}
                        >
                            일간
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange("weekly")}
                            style={{ fontWeight: type === "weekly" ? "bold" : "normal" }}
                        >
                            주간
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange("monthly")}
                            style={{ fontWeight: type === "monthly" ? "bold" : "normal" }}
                        >
                            월간
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <label style={{ fontSize: "14px", color: "#555" }}>조회 기간:</label>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="기간을 선택하세요"
                            isClearable={true}
                            className="custom-datepicker" 
                        />
                    </div>
                </div>

                <UserDetailInfo user={user} />

                <TotalStudy 
                    type={type} 
                    start={formattedStartDate} 
                    end={formattedEndDate} 
                    userId={user._id} 
                />

                <SubjectRecord 
                    type={type} 
                    start={formattedStartDate} 
                    end={formattedEndDate} 
                    userId={user._id} 
                />
            </div>
        </div>
    )
}