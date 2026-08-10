import test from "node:test"
import assert from "node:assert/strict"

import { validatePasswordChange } from "./password.js"

test("비밀번호 변경 입력값이 모두 필요하다", () => {
    assert.equal(
        validatePasswordChange({
            currentPassword: "",
            newPassword: "new-password",
            newPasswordConfirm: "new-password",
        }),
        "현재 비밀번호를 입력해주세요.",
    )
})

test("새 비밀번호는 8자 이상이어야 한다", () => {
    assert.equal(
        validatePasswordChange({
            currentPassword: "old-password",
            newPassword: "short",
            newPasswordConfirm: "short",
        }),
        "새 비밀번호는 8자 이상이어야 합니다.",
    )
})

test("새 비밀번호와 확인 값이 일치해야 한다", () => {
    assert.equal(
        validatePasswordChange({
            currentPassword: "old-password",
            newPassword: "new-password",
            newPasswordConfirm: "other-password",
        }),
        "새 비밀번호가 일치하지 않습니다.",
    )
})

test("현재 비밀번호와 새 비밀번호는 달라야 한다", () => {
    assert.equal(
        validatePasswordChange({
            currentPassword: "same-password",
            newPassword: "same-password",
            newPasswordConfirm: "same-password",
        }),
        "새 비밀번호는 현재 비밀번호와 다르게 설정해주세요.",
    )
})

test("유효한 비밀번호 변경 입력값은 오류가 없다", () => {
    assert.equal(
        validatePasswordChange({
            currentPassword: "old-password",
            newPassword: "new-password",
            newPasswordConfirm: "new-password",
        }),
        null,
    )
})
