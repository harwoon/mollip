import { useEffect, useState } from "react"
import { getMyInfo } from "../features/auth/api/auth"

const API_URL = import.meta.env.VITE_LOCAL_API_URL

export default function SidebarUserInfo(){
    // 닉네임, 프로필 이미지 경로 저장
    const [user, setUser] = useState({
        nickname: "",
        profileImg: ""
    })

    useEffect(() => {
        async function loadUserInfo() {
            try{
                const data = await getMyInfo()

                // /auth/me 응답의 user 객체에서 필요한 값 저장
                setUser({
                    nickname: data.user.nickname ?? "",
                    profileImg: data.user.profileImg ?? ""
                })
            }catch(error){
                console.error("사이드바 사용자 정보 조회 오류: ", error)
            }
        }
        loadUserInfo()
    }, [])

    // DB에는 /uploads/profile/... 형태의 상대 경로가 저장되므로
    // 백엔드 서버 주소를 앞에 붙여 실제 이미지 주소 생성
    const profileImageUrl = user.profileImg
        ? `${API_URL}${user.profileImg}`
        : "/images/default-profile.png"

        
    return (
        <div className="sidebarUserInfo">
            <div className="sidebarUSerImgBox">
                <img
                    src={profileImageUrl}
                    alt={`${user.nickname || "사용자"} 프로필`}
                    className="sidebarProfileImage"
                    onError={(event) => {
                        // 이미지 파일을 불러오지 못하면 기본 이미지 표시
                        event.currentTarget.src = "/images/noprofile.png"
                    }}
                />
            </div>

            <p className="sidebarGreeting">
                <strong>{user.nickname || "사용자"}님</strong>
                <span> 안녕하세요!</span>
            </p>
        </div>
    )
}