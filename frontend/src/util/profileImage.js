const API_URL =
    import.meta.env.VITE_LOCAL_API_URL

export function getProfileImageUrl(
    profileImg,
) {
    // 프로필 이미지가 없는 경우
    if (!profileImg) {
        return "/images/noprofile.png"
    }

    // Google 등 외부 이미지 주소인 경우
    if (
        profileImg.startsWith("http://") ||
        profileImg.startsWith("https://")
    ) {
        return profileImg
    }

    // 백엔드 업로드 이미지인 경우
    return `${API_URL}${profileImg}`
}