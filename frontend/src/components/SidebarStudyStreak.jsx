import { useEffect, useState } from "react"
import { getMyInfo } from "../features/auth/api/auth"

export default function SidebarStudyStreak() {
    // 현재 연속 학습일, 최고 연속 학습일 저장
    const [studyStreak, setStudyStreak] = useState({
        currentStreak: 0,
        maxStreak: 0
    })

    // 서버에서 사용자 정보 불러오는중인지 확인
    const [loading, setLoading] = useState(true)

    // 컴포넌트가 처음 화면에 나타날 때: 사용자 정보 조회
    useEffect(() => {
        async function loadStudyStreak() {
            try{
                // 로그인한 사용자 정보 조회
                const data = await getMyInfo()

                // /auth/me 응답의 user 객체에서 연속 학습일 가져오기
                setStudyStreak({
                    currentStreak: data.user.currentStreak ?? 0,
                    maxStreak: data.user.maxStreak ?? 0
                })

            }catch(error){
                console.error("연속 학습일 조회 오류: ", error)
            }finally{
                setLoading(false)
            }
        }
        loadStudyStreak()
    }, [])

    return (
        <div className="sidebarStudyStreak">
            <p className="sidebarStudyTitle">
                연속 학습일
            </p>

            <div className="sidebarStudyCount">
                <strong>{studyStreak.currentStreak}</strong>
                <span>일</span>
                <span aria-hidden="true">🔥</span>
            </div>

            <p className="sidebarStudyMax">
                최고 학습 기록 {studyStreak.maxStreak}일
            </p>
        </div>
    )
}