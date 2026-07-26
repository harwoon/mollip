// signup.html 로드 시 
window.onload = function() {
    // 중복 확인 초기화 (아이디 변경 후 중복확인 없이 이전 중복 체크 결과로 통과되는 점 방지)
    document.getElementById("userid").addEventListener("input", () => {
        document.getElementById("userid").dataset.checked = "false"
    })

    // 폼의 기본 제출(페이지 이동) 막음
    document.getElementById("signupForm").addEventListener("submit", async(e) => {
        e.preventDefault()
        await sendit()
    })

    // 회원 가입 폼 입력 css 초기화
    const fieldsToReset = ["userid", "userpw", "userpw_re", "nickname", "username", "email"]
    fieldsToReset.forEach((id) => {
        document.getElementById(id).addEventListener("input", () => {
            document.getElementById(id).classList.remove("check-success", "check-fail")
        })
    })
}

const expIdTest = /^[A-Za-z0-9]{4,20}$/
const expPwTest = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,20}$/
const expEmailTest = /^[A-Za-z0-9.-]+@[A-Za-z0-9-]+\.[A-Za-z]+$/

async function sendit() {
    const userid = document.getElementById("userid")
    const userpw = document.getElementById("userpw")
    const userpw_re = document.getElementById("userpw_re")
    const nickname = document.getElementById("nickname")
    const username = document.getElementById("username")
    const email = document.getElementById("email")

    // 아이디
    if(userid.value === "") {
        alert("아이디를 입력하세요")
        userid.focus()
        userid.classList.remove("check-success")
        userid.classList.add("check-fail")
        return
    }

    if(!expIdTest.test(userid.value)) {
        alert("아이디는 4자 이상 20자 이하의 영문자 또는 숫자로 입력하세요")
        userid.focus()
        userid.classList.remove("check-success")
        userid.classList.add("check-fail")
        return
    }

    if (userid.dataset.checked !== "true") {
        alert("아이디 중복확인을 해주세요")
        userid.focus()
        return
    }

    // 비밀번호
    if(userpw.value === "") {
        alert("비밀번호를 입력하세요")
        userpw.focus()
        userpw.classList.remove("check-success")
        userpw.classList.add("check-fail")
        return
    }

    if(!expPwTest.test(userpw.value)) {
        alert("비밀번호는 8자 이상 20자 이하이며 영문자, 숫자, 특수문자를 포함해야 합니다")
        userpw.focus()
        userpw.classList.remove("check-success")
        userpw.classList.add("check-fail")
        return
    }

    // 비빌번호 확인
    if(userpw_re.value === "") {
        alert("비밀번호 확인을 입력하세요")
        userpw_re.focus()
        userpw_re.classList.remove("check-success")
        userpw_re.classList.add("check-fail")
        return
    }
    
    if(userpw.value !== userpw_re.value) {
        alert("비밀번호가 일치하지 않습니다")
        userpw_re.focus()
        userpw_re.classList.remove("check-success")
        userpw_re.classList.add("check-fail")
        return
    }
    
    // 닉네임
    if(nickname.value === "") {
        alert("닉네임을 입력하세요")
        nickname.focus()
        nickname.classList.remove("check-success")
        nickname.classList.add("check-fail")
        return
    }

    // 이름
    if(username.value === "") {
        alert("이름을 입력하세요")
        username.focus()
        username.classList.remove("check-success")
        username.classList.add("check-fail")
        return
    }

    // 이메일
    if(email.value === "") {
        alert("이메일을 입력하세요")
        email.focus()
        email.classList.remove("check-success")
        email.classList.add("check-fail")
        return
    }

    if(!expEmailTest.test(email.value)) {
        alert("이메일 형식이 올바르지 않습니다")
        email.focus()
        email.classList.remove("check-success")
        email.classList.add("check-fail")
        return
    }

    // 서버로 회원가입 요청 전송
    try {
        const res = await fetch("/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userid: userid.value,
                userpw: userpw.value,
                nickname: nickname.value,
                username: username.value,
                email: email.value,
            })
        }) 

        const data = await res.json()

        if(!res.ok) {
            alert(data.message || "회원가입에 실패했습니다")
            return
        }

        localStorage.setItem("token", data.token)
        alert("회원가입이 완료되었습니다")
        window.location.href = "/login.html"
    } catch (error) {
        console.error("회원가입 서버 통신 오류:", error)
        alert("서버와 통신 중 오류가 발생했습니다")
    }
}

// 아이디 중복확인
async function duplCheck() {
    const userid = document.getElementById("userid")

    if(userid.value === "") {
        alert("아이디를 먼저 입력하세요")
        userid.focus()
        userid.classList.remove("check-success")
        userid.classList.add("check-fail")
        return
    }
    
    if(!expIdTest.test(userid.value)) {
        alert("아이디는 4자 이상 20자 이하의 영문자 또는 숫자로 입력하세요")
        userid.focus()
        userid.classList.remove("check-success")
        userid.classList.add("check-fail")
        return
    }

    try {
        const res = await fetch(`/auth/checkId?userid=${encodeURIComponent(userid.value)}`)
        const data = await res.json()

        if (data.exists) {
            alert("이미 사용중인 아이디입니다")
            userid.dataset.checked = "false"  
            userid.focus()
            userid.classList.remove("check-success")
            userid.classList.add("check-fail")
        } else {
            alert("사용 가능한 아이디입니다")
            userid.dataset.checked = "true"   
            userid.classList.remove("check-fail")
            userid.classList.add("check-success")
        }
    } catch (err) {
        console.error(err)
        alert("아이디 중복확인 중 오류가 발생했습니다")
    }
}