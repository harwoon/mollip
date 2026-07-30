import { useState } from "react"
import { signupUser } from "../api/auth"
import { useNavigate } from "react-router-dom"
import { checkIdUser } from "../api/auth"

export default function LoginForm() {
    const [userId, setUserId] = useState("")
    const [userPw, setUserPw] = useState("")
    const [userPwRe, setUserPwRe] = useState("")
    const [nickname, setNickname] = useState("")
    const [email, setEmail] = useState("")

    const [idCheck, setIdCheck] = useState(false)

    const navigate = useNavigate()

    const handleIdCheck = async (e) => {
        try {

            const check = await checkIdUser(userId)

            if (check.exists === true) {
                alert("이미 존재하는 아이디입니다.")
                setIdCheck(false)
            }

            else if(check.exists === false) {
                alert("사용 가능한 아이디입니다.")
                setIdCheck(true)
            }

        } catch (error) {
            alert("아이디 중복 체크 실패 " + error.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {

            if (!idCheck) {
                alert("중복 아이디 확인을 해주세요")
                return
            }

            // 비밀번호, 재확인 일치 확인 로직
            if (userPw !== userPwRe) {
                alert("비밀번호가 일치하지 않습니다.")
                return
            }

            const result = await signupUser(userId, userPw, nickname, email)
            console.log("회원가입 성공!", result)
            navigate('/')

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
                type="password"
                value={userPw}
                onChange={(e) => setUserPw(e.target.value)}
                placeholder="비밀번호"
            />
            <input
                type="password"
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
            />
            <button type="button" onClick={handleClick}>로그인</button>
            <button type="submit">회원가입</button>
        </form>
    )
}