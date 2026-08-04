import React from "react"
import "./UserDetailModal.css"
import SubjectRecord from "../features/user/components/SubjectRecord"

export default function UserDetailModal({ user, onClose }) {
    // 유저 정보가 없으면 렌더링하지 않음
    if (!user) return null

    return (
        // 1. 모달 전체 뒷배경 (어둡게 처리 및 전체 화면 차지)
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 검은색 배경
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999 // 화면 맨 앞으로 가져오기
            }}
        >
            {/* 2. 실제 모달 내용 박스 (하얀색 바탕) */}
            <div
                onClick={(e) => e.stopPropagation()} // 박스 안쪽을 클릭했을 땐 모달이 안 닫히게 방지
                style={{
                    backgroundColor: "#fff",
                    padding: "30px",
                    borderRadius: "10px",
                    width: "80%",
                    maxWidth: "800px",
                    maxHeight: "90vh",
                    overflowY: "auto", // 내용이 길면 스크롤 생성
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

                {/* --- [상단 영역] 이미지 기획안 기반 요약 정보 --- */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>

                    {/* 프로필 이미지 및 기본 정보 */}
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <img
                            src={user.profileImage || null}
                            alt="프로필"
                            style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#eee", objectFit: "cover" }}
                        />
                        <div>
                            <h3 style={{ margin: "0 0 5px 0" }}>
                                {user.nickname}
                                <span style={{ fontSize: "0.8rem", color: user.isStudying ? "green" : "gray", marginLeft: "10px" }}>
                                    {user.isStudying ? "활동(공부중)" : "휴식중"}
                                </span>
                            </h3>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                                가입일: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ko-KR") : "정보 없음"}<br />
                                소속 그룹: {user.group ? user.group.groupName : "없음"}
                            </p>
                        </div>
                    </div>

                    {/* 핵심 요약 수치 */}
                    <div style={{ display: "flex", gap: "30px", textAlign: "center" }}>
                        <div>
                            <p style={{ margin: "0 0 5px 0", fontSize: "0.9rem", color: "#666" }}>연속 학습일</p>
                            <strong style={{ fontSize: "1.2rem" }}>{user.currentStreak || 0}일</strong>
                        </div>
                        <div>
                            <p style={{ margin: "0 0 5px 0", fontSize: "0.9rem", color: "#666" }}>이번 주 공부시간</p>
                            <strong style={{ fontSize: "1.2rem" }}>
                                {user.weeklyStudyTime ? Math.floor(user.weeklyStudyTime / 60) : 0}시간
                            </strong>
                        </div>
                        <div>
                            <p style={{ margin: "0 0 5px 0", fontSize: "0.9rem", color: "#666" }}>목표 달성률</p>
                            <strong style={{ fontSize: "1.2rem" }}>{user.achievementRate || 0}%</strong>
                        </div>
                    </div>
                </div>

                {/* --- [하단 영역] 기본 정보 상세 --- */}
                <div style={{ border: "1px solid #eee", padding: "20px", borderRadius: "8px" }}>
                    <h4 style={{ margin: "0 0 15px 0" }}>기본 정보</h4>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.95rem" }}>
                        <li style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#666" }}>이메일</span>
                            <span>{user.email || "정보 없음"}</span>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#666" }}>최근 공부일(마지막 공부일)</span>
                            <span>{user.lastStudyDate ? new Date(user.lastStudyDate).toLocaleDateString("ko-KR") : "기록 없음"}</span>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#666" }}>전체 누적 공부시간</span>
                            <span>{user.totalStudyTime ? Math.floor(user.totalStudyTime / 60) : 0}시간</span>
                        </li>
                    </ul>
                </div>

            </div>
            <div><SubjectRecord type={"daily"} date={"2026-08-04"}/></div>
        </div>
    )
}