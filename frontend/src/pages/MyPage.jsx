import SubjectInfo from "../features/mypage/components/SubjectInfo"
import UserInfo from "../features/mypage/components/UserInfo"

export default function MyPage() {
    return (
        <div className="myPage">
            <UserInfo />
            <SubjectInfo />
        </div>
    )
}