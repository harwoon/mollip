import { useState } from "react"
import { loginUser } from "../api/auth"

export default function LoginForm() {
  const [userId, setUserId] = useState("")
  const [userPw, setUserPw] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await loginUser(userId, userPw);
      console.log("로그인 성공!", result);
 
    } catch (error) {
      alert("로그인 실패: " + error.message)
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
        type="userPw" 
        value={userPw} 
        onChange={(e) => setUserPw(e.target.value)} 
        placeholder="비밀번호" 
      />
      <button type="submit">로그인</button>
    </form>
  )
}