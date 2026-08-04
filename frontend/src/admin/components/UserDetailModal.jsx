import React from "react"
import "./UserDetailModal.css"

import UserDetailInfo from "../features/user/components/UserDetailInfo"
import SubjectRecord from "../features/user/components/SubjectRecord"

export default function UserDetailModal({ user, onClose }) {
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


                {/* 유저 정보 컴포넌트 렌더링 */}
                <UserDetailInfo user={user} />
                
                {/* 차트 컴포넌트 렌더링 */}
                <div>
                    <SubjectRecord type={"daily"} date={"2026-08-04"} />
                </div>

            </div>
        </div>
    )
}