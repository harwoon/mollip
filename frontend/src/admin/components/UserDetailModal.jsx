import React from "react"
import "./UserDetailModal.css"

export default function UserDetailModal({ user, onClose }) {
    // 유저 정보가 없으면 아무것도 렌더링하지 않음
    if (!user) return null

    return (
        <>
        <div className="userDetailOverlay" onClick={onClose}>
            <div className="userDetailBox" onClick={(e) => e.stopPropagation()}>
                <div className="userDetailHeader">
                    <strong>회원 상세 정보</strong>
                    <button type="button" onClick={onClose}>✕</button>
                </div>

                <div className="userDetailBody">
                    <p>user: {JSON.stringify(user)}</p>
                </div>
            </div>
        </div>
        <div>
            <h2>회원 상세</h2>
            
            {/* 프로필 이미지 (이미지가 없을 경우를 대비해 기본 alt 텍스트 제공) */}
            <div>
                <img 
                    src={user.profileImage || ""} 
                    alt={`${user.nickname}님의 프로필`} 
                    width="100" 
                    height="100" 
                />
            </div>

            {/* 회원 상세 정보 리스트 */}
            <ul>
                <li><strong>닉네임:</strong> {user.nickname}</li>
                <li><strong>이메일:</strong> {user.email}</li>
                <li><strong>가입일:</strong> {new Date(user.createdAt).toLocaleDateString("ko-KR")}</li>
                <li><strong>소속 그룹:</strong> {user.group ? user.group.groupName : "소속 없음"}</li>
                
                <li><strong>최근 공부일:</strong> {user.lastStudyDate || "기록 없음"}</li>
                <li>
                    <strong>전체 누적 공부시간 / 연속 학습일:</strong> 
                    {user.totalStudyTime || 0}분 / {user.currentStreak || 0}일
                </li>
                <li><strong>이번주 공부시간:</strong> {user.weeklyStudyTime || 0}분</li>
                <li><strong>목표 달성률:</strong> {user.achievementRate || 0}%</li>
            </ul>

            <button type="button" onClick={onClose}>닫기</button>
        </div>
        </>
    )
}