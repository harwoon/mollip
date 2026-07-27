import { useState } from "react"
import { signupUser } from "../api/auth"
import { useNavigate } from "react-router-dom"

export default function LoginForm() {
    const [userId, setUserId] = useState("")
    const [userPw, setUserPw] = useState("")
    const [userPwRe, setUserPwRe] = useState("")
    const [nickname, setNickname] = useState("")
    const [email, setEmail] = useState("")

    const navigate = useNavigate()

    const handleIdCheck = async (e) => {
        try {
            
        } catch (error) {
            alert("아이디 중복 체크 실패 " + error.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // 아이디 중복 확인 체크 로직
            const idCheck = await checkIdUser(userId)
            if(!idCheck){
                alert("이미 존재하는 아이디입니다.")
            }

            // 비밀번호, 재확인 일치 확인 로직
            if(userPw !== userPwRe){
                alert("비밀번호가 일치하지 않습니다.")
            }

            const result = await signupUser(userId, userPw, nickname, email)
            console.log("회원가입 성공!", result)
            navigate('/home')

        } catch (error) {
            alert("회원가입 실패: " + error.message)
        }
    }

    const handleClick = async (e) => {
        try {
            console.log(" 성공!")
            navigate('/')

        } catch (error) {
            alert("로그인 이동 실패: " + error.message)
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
            <button type="button" onClick={handleIdCheck}>중복 확인</button>
            <input
                type="userPw"
                value={userPw}
                onChange={(e) => setUserPw(e.target.value)}
                placeholder="비밀번호"
            />
            <input
                type="userPw"
                value={userPwRe}
                onChange={(e) => setUserPwRe(e.target.value)}
                placeholder="비밀번호 재확인"
            />
            <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
            />
            <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
            />
            <button type="button" onClick={handleClick}>로그인</button>
            <button type="submit">회원가입</button>
        </form>
    )
}