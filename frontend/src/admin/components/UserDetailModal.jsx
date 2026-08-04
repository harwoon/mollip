import "./UserDetailModal.css"

export default function UserDetailModal({ user, onClose }) {
    return (
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
    )
}