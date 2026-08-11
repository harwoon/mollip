const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
].join(",")


export function getModalFocusableElements(container) {
    if (!container?.querySelectorAll) {
        return []
    }

    return Array.from(
        container.querySelectorAll(FOCUSABLE_SELECTOR)
    )
}


export function resolveModalKeyAction({
    key,
    shiftKey = false,
    activeElement,
    focusableElements = [],
    fallbackElement
}) {
    if (key === "Escape") {
        return { type: "close" }
    }

    if (key !== "Tab") {
        return { type: "none" }
    }

    if (focusableElements.length === 0) {
        return {
            type: "focus",
            target: fallbackElement
        }
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)

    if (shiftKey && activeElement === firstElement) {
        return { type: "focus", target: lastElement }
    }

    if (!shiftKey && activeElement === lastElement) {
        return { type: "focus", target: firstElement }
    }

    return { type: "none" }
}
