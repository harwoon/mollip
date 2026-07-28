import { useState } from "react"
import { loginUser } from "../api/auth"
import { useNavigate } from "react-router-dom"

export default function LoginForm() {
    const [userId, setUserId] = useState("")
    const [userPw, setUserPw] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const result = await loginUser(userId, userPw)
            console.log("로그인 성공!", result)
            navigate('/home')

        } catch (error) {
            alert("로그인 실패: " + error.message)
        }
    }

    const handleClick = async (e) => {
        try {
            console.log("회원가입 버튼 눌림")
            navigate('/signup')

        } catch (error) {
            alert("회원가입 이동 실패: " + error.message)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="아이디"
            />
            <input
                type="password"
                value={userPw}
                onChange={(e) => setUserPw(e.target.value)}
                placeholder="비밀번호"
            />
            <button type="submit">로그인</button>
            <button type="button" onClick={handleClick}>회원가입</button>
        </form>
    )
}