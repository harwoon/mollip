import { createPortal } from "react-dom"
import { FiX } from "react-icons/fi"

export default function AppModal({
    open = false,

    type = "action",

    title,
    description,
    icon,

    children,
    footer,

    onClose,

    showClose = true,
    closeOnOverlay = true
}) {
    if (!open) {
        return null
    }

    const handleOverlayMouseDown = () => {
        if (closeOnOverlay && onClose) {
            onClose()
        }
    }

    const modalTypeClassName =
        type === "large"
            ? "app-modal-large"
            : "app-modal-action"

    return createPortal(
        <div
            className="app-modal-overlay"
            onMouseDown={handleOverlayMouseDown}
        >
            <section
                className={`app-modal ${modalTypeClassName}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="app-modal-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className="app-modal-header">
                    <div className="app-modal-header-main">

                        {icon && (
                            <div
                                className="app-modal-header-icon"
                                aria-hidden="true"
                            >
                                {icon}
                            </div>
                        )}

                        <div className="app-modal-heading">
                            {title && (
                                <h2
                                    id="app-modal-title"
                                    className="app-modal-title"
                                >
                                    {title}
                                </h2>
                            )}

                            {description && (
                                <p className="app-modal-description">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {showClose && onClose && (
                        <button
                            type="button"
                            className="app-btn-close"
                            onClick={onClose}
                            aria-label="모달 닫기"
                        >
                            <FiX />
                        </button>
                    )}
                </header>

                <div className="app-modal-body">
                    {children}
                </div>

                {footer && (
                    <footer className="app-modal-footer">
                        {footer}
                    </footer>
                )}
            </section>
        </div>,
        document.body
    )
}