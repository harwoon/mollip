import React, { useState } from "react"
import "./UserDetailModal.css"

import UserDetailInfo from "../features/user/components/UserDetailInfo"
import SubjectRecord from "../features/user/components/SubjectRecord"

export default function UserDetailModal({ user, onClose }) {
    const [type, setType] = useState("daily")

    const today = new Date().toISOString().split("T")[0]
    const [selectedDate, setSelectedDate] = useState(today)

    if (!user) return null

    return (
        // 모달 전체 뒷배경
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
            {/* 모달 내용 박스*/}
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
                {/* 닫기 버튼 영역 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                    <h2 style={{ margin: 0 }}>회원 상세</h2>
                    <button type="button" onClick={onClose} style={{ cursor: "pointer", padding: "5px 10px" }}>✕ 닫기</button>
                </div>

                {/* 일간/주간/월간 버튼 */}
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

                    {/* 날짜 기간 선택 */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <label htmlFor="date-picker" style={{ fontSize: "14px", color: "#555" }}>기준일 선택:</label>
                        <input
                            id="date-picker"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ padding: "5px", borderRadius: "5px", border: "1px solid #ccc" }}
                        />
                    </div>
                </div>

                {/* 유저 정보 컴포넌트 렌더링 */}
                <UserDetailInfo user={user} />

                {/* 차트 컴포넌트 렌더링 */}
                <SubjectRecord type={type} date={selectedDate} userId={user._id} />

            </div>
        </div>
    )
}