import React, { useState } from "react"
import "./UserDetailModal.css"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import dayjs from "dayjs"

import UserDetailInfo from "../features/user/components/UserDetailInfo"
import SubjectRecord from "../features/user/components/SubjectRecord"
import Todo from "../features/user/components/Todo"

export default function UserDetailModal({ user, onClose }) {
    const [type, setType] = useState("daily")

    const today = new Date()
    const lastWeek = new Date()
    lastWeek.setDate(today.getDate() - 7)

    const [dateRange, setDateRange] = useState([lastWeek, today])
    const [startDate, endDate] = dateRange

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
                            onClick={() => setType("daily")}
                            style={{ fontWeight: type === "daily" ? "bold" : "normal" }}
                        >
                            일간
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("weekly")}
                            style={{ fontWeight: type === "weekly" ? "bold" : "normal" }}
                        >
                            주간
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("monthly")}
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
                            onChange={(update) => setDateRange(update)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="기간을 선택하세요"
                            isClearable={true}
                            className="custom-datepicker" 
                        />
                    </div>
                </div>

                <UserDetailInfo user={user} />

                <SubjectRecord 
                    type={type} 
                    start={formattedStartDate} 
                    end={formattedEndDate} 
                    userId={user._id} 
                />

                <Todo 
                    type={type} 
                    startDate={formattedStartDate} 
                    endDate={formattedEndDate} 
                    userId={user._id} 
                />
            </div>
        </div>
    )
}