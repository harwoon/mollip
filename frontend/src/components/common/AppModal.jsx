import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { FiX } from "react-icons/fi"

import {
    getModalFocusableElements,
    resolveModalKeyAction
} from "./modalKeyboard.js"

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
    const modalRef = useRef(null)
    const previousFocusRef = useRef(null)

    useEffect(() => {
        if (!open) {
            return undefined
        }

        previousFocusRef.current = document.activeElement

        const focusFrame = window.requestAnimationFrame(() => {
            const focusableElements = getModalFocusableElements(
                modalRef.current
            )

            ;(focusableElements[0] || modalRef.current)?.focus()
        })

        const handleKeyDown = (event) => {
            const action = resolveModalKeyAction({
                key: event.key,
                shiftKey: event.shiftKey,
                activeElement: document.activeElement,
                focusableElements: getModalFocusableElements(
                    modalRef.current
                ),
                fallbackElement: modalRef.current
            })

            if (action.type === "close") {
                event.preventDefault()
                onClose?.()
                return
            }

            if (action.type === "focus" && action.target) {
                event.preventDefault()
                action.target.focus()
            }
        }

        document.addEventListener("keydown", handleKeyDown)

        return () => {
            window.cancelAnimationFrame(focusFrame)
            document.removeEventListener("keydown", handleKeyDown)

            const previousFocus = previousFocusRef.current

            if (previousFocus?.isConnected) {
                previousFocus.focus()
            }
        }
    }, [open, onClose])

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
                ref={modalRef}
                className={`app-modal ${modalTypeClassName}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="app-modal-title"
                tabIndex={-1}
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
