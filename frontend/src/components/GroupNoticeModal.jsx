import { createPortal } from "react-dom"
import "./GroupNoticeModal.css"

function getGroupNoticeContent(notice) {
    switch (notice.status) {
        case "UP":
            return {
                title: "그룹 상승!",
                message:
                    `${notice.previousGroupName}에서 ` +
                    `${notice.currentGroupName} 그룹으로 상승했어요!`,
                image:
                    "/images/groupNotice/up.png",
            }

        case "DOWN":
            return {
                title: "그룹 하락",
                message:
                    `${notice.previousGroupName}에서 ` +
                    `${notice.currentGroupName} 그룹으로 하락했어요.`,
                image:
                    "/images/groupNotice/down.png",
            }

        case "RETURN":
            return {
                title: "복귀를 환영합니다!",
                message:
                    `복귀하셨습니다. ` +
                    `${notice.currentGroupName} 그룹에 배정됩니다.`,
                image:
                    "/images/groupNotice/return.png",
            }

        case "NEW":
            return {
                title: "가입을 축하드립니다!",
                message:
                    `${notice.currentGroupName} 그룹에 배정되었습니다.`,
                image:
                    "/images/groupNotice/new.png",
            }

        case "SAME":
        default:
            return {
                title: "그룹 유지",
                message:
                    `이번 주에도 ${notice.currentGroupName} 그룹을 유지했어요.`,
                image:
                    "/images/groupNotice/same.png",
            }
    }
}

export default function GroupNoticeModal({
    open,
    notice,
    onClose,
}) {
    if (!open || !notice) {
        return null
    }

    const content =
        getGroupNoticeContent(notice)

    return createPortal(
        <div
            className="groupNoticeOverlay"
            onClick={onClose}
        >
            <div
                className="groupNoticeModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="group-notice-title"
                onClick={(event) => {
                    event.stopPropagation()
                }}
            >
                <img
                    className="groupNoticeImage"
                    src={content.image}
                    alt=""
                />

                <h2
                    id="group-notice-title"
                    className="groupNoticeTitle"
                >
                    {content.title}
                </h2>

                <p className="groupNoticeMessage">
                    {content.message}
                </p>

                <button
                    type="button"
                    className="groupNoticeButton"
                    onClick={onClose}
                >
                    확인
                </button>
            </div>
        </div>,
        document.body,
    )
}