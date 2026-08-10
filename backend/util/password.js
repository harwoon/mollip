export function validatePasswordChange({
    currentPassword,
    newPassword,
    newPasswordConfirm,
}) {
    if (!currentPassword) {
        return "현재 비밀번호를 입력해주세요."
    }

    if (!newPassword) {
        return "새 비밀번호를 입력해주세요."
    }

    if (!newPasswordConfirm) {
        return "새 비밀번호 확인을 입력해주세요."
    }

    if (newPassword.length < 8) {
        return "새 비밀번호는 8자 이상이어야 합니다."
    }

    if (newPassword !== newPasswordConfirm) {
        return "새 비밀번호가 일치하지 않습니다."
    }

    if (currentPassword === newPassword) {
        return "새 비밀번호는 현재 비밀번호와 다르게 설정해주세요."
    }

    return null
}
