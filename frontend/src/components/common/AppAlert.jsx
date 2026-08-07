import { createPortal } from "react-dom"
import {
    FiAlertTriangle,
    FiCheck,
    FiInfo,
    FiX
} from "react-icons/fi"

export default function AppAlert({
    open = false,

    type = "info",

    title,
    message,
    items = [],

    confirmText = "확인",
    cancelText = "취소",

    showCancel = false,
    showClose = true,

    onConfirm,
    onCancel,
    onClose
}) {
    if (!open) {
        return null
    }

    const handleClose = () => {
        if (onClose) {
            onClose()
            return
        }

        if (onCancel) {
            onCancel()
            return
        }

        if (onConfirm) {
            onConfirm()
        }
    }

    const renderIcon = () => {
        switch (type) {
            case "success":
                return <FiCheck />

            case "warning":
            case "danger":
                return <FiAlertTriangle />

            default:
                return <FiInfo />
        }
    }

    const getIconClassName = () => {
        switch (type) {
            case "success":
                return "app-alert-icon-success"

            case "warning":
                return "app-alert-icon-warning"

            case "danger":
                return "app-alert-icon-danger"

            default:
                return "app-alert-icon-info"
        }
    }

    const getConfirmButtonClassName = () => {
        if (type === "danger") {
            return "app-btn-danger"
        }

        return "app-btn-primary"
    }

    return createPortal(
        <div
            className="app-alert-overlay"
            onMouseDown={handleClose}
        >
            <div
                className="app-alert"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="app-alert-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                {showClose && (
                    <button
                        type="button"
                        className="app-alert-close"
                        onClick={handleClose}
                        aria-label="알림 닫기"
                    >
                        <FiX />
                    </button>
                )}

                <div
                    className={`app-alert-icon ${getIconClassName()}`}
                    aria-hidden="true"
                >
                    {renderIcon()}
                </div>

                {title && (
                    <h2
                        id="app-alert-title"
                        className="app-alert-title"
                    >
                        {title}
                    </h2>
                )}

                {message && (
                    <p className="app-alert-message">
                        {message}
                    </p>
                )}

                {items.length > 0 && (
                    <ul className="app-alert-list">
                        {items.map((item, index) => (
                            <li key={`${item}-${index}`}>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

                <div
                    className={
                        showCancel
                            ? "app-alert-actions"
                            : "app-alert-actions app-alert-actions-single"
                    }
                >
                    {showCancel && (
                        <button
                            type="button"
                            className="app-btn-secondary"
                            onClick={onCancel || handleClose}
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        type="button"
                        className={getConfirmButtonClassName()}
                        onClick={onConfirm || handleClose}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}