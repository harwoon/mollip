import assert from "node:assert/strict"
import test from "node:test"

import { resolveModalKeyAction } from "./modalKeyboard.js"


test("Escape 키는 모달 닫기 동작을 반환한다", () => {
    assert.deepEqual(
        resolveModalKeyAction({ key: "Escape" }),
        { type: "close" }
    )
})


test("첫 요소에서 Shift+Tab을 누르면 마지막 요소로 포커스를 이동한다", () => {
    const first = { id: "first" }
    const last = { id: "last" }

    assert.deepEqual(
        resolveModalKeyAction({
            key: "Tab",
            shiftKey: true,
            activeElement: first,
            focusableElements: [first, last],
            fallbackElement: { id: "dialog" }
        }),
        { type: "focus", target: last }
    )
})


test("마지막 요소에서 Tab을 누르면 첫 요소로 포커스를 이동한다", () => {
    const first = { id: "first" }
    const last = { id: "last" }

    assert.deepEqual(
        resolveModalKeyAction({
            key: "Tab",
            activeElement: last,
            focusableElements: [first, last],
            fallbackElement: { id: "dialog" }
        }),
        { type: "focus", target: first }
    )
})


test("포커스 가능한 요소가 없으면 대화상자 자체에 포커스를 유지한다", () => {
    const dialog = { id: "dialog" }

    assert.deepEqual(
        resolveModalKeyAction({
            key: "Tab",
            focusableElements: [],
            fallbackElement: dialog
        }),
        { type: "focus", target: dialog }
    )
})
