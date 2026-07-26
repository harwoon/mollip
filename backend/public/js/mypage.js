const logoutBtn = document.getElementById("logoutBtn")

const profileForm = document.getElementById("profileForm")
const profileUserid = document.getElementById("profileUserid")
const nickname = document.getElementById("nickname")
const username = document.getElementById("username")
const email = document.getElementById("email")

const editBtn = document.getElementById("editBtn")
const editAct = document.getElementById("editAct")
const cancelBtn = document.getElementById("cancelBtn")
const submitBtn = document.getElementById("submitBtn")

const studyDays = document.getElementById("studyDays")

const profileEditBtn = document.getElementById("profileEditBtn")
const profileImageInput = document.getElementById("profileImageInput")
const profileImg = document.querySelector(".PImgSec .imgBox img")

// 로그아웃
logoutBtn.addEventListener("click", () => {
    // confirm = true/false 반환값
    const check = confirm("로그아웃 하시겠습니까?")
    if(!check) return // 취소(false)

    // JWT 토큰 삭제
    localStorage.removeItem("token")
    localStorage.removeItem("userid")
    // console.log("로그아웃 완료")
    
    // 다시 메인이동
    window.location.href = "/login.html"
})

// 페이지 열리면 회원정보 불러 옴
window.addEventListener("DOMContentLoaded", () => {
    getUser()
})

// 회원정보 조회
async function getUser() {
    // 토큰 있어야만 페이지 접속가능
    const token = localStorage.getItem("token")
    if(!token){
        alert("로그인 후 서비스이용이 가능합니다.")
        location.href = "/login.html"
        return
    }

    // 회원정보 서버에 요청
    try{
        const response = await fetch("/auth/me", {
            method: "GET",
            headers: {Authorization: `Bearer ${token}`}
        })

        const data = await response.json()
        if(!response.ok){
            alert(data.message)
            localStorage.removeItem("token")
            location.href = "/login.html"
            return
        }

        // 서버에서 받아 온 정보 출력
        const user = data.user
        profileUserid.textContent = user.userid
        nickname.value = user.nickname
        username.value = user.username
        email.value = user.email
        // console.log("회원정보:", user)

        // 공부한 날짜 계산(가입일~현재)
        const joinDate = new Date(user.createdAt) // 가입일 설정
        const today = new Date()    // 오늘날짜 가져옴
        console.log("createdAt 원본:", user.createdAt)

        // 두 날짜 시, 분, 초 맞춤
        joinDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // 밀리초 차이 구함
        const diffMS = today.getTime() - joinDate.getTime();

        // 일수 계산: ~일째 표시하기위해 +1함
        const diffDays = Math.floor(diffMS / (1000 * 60 * 60 * 24)) + 1;
        // 출력
        studyDays.textContent = diffDays

        // 저장된 프로필 이미지가 있으면 출력
        if (user.profileImage) {
            profileImg.src = user.profileImage
        } else {
            profileImg.src = "./images/noprofile.png"   // 없으면 기본 이미지
        }

    }catch (error) {
        console.error("회원정보 조회 오류:", error)
        alert("회원정보를 불러오지 못했습니다.")
    }
}

// 우측 수정버튼 클릭
editBtn.addEventListener("click", () => {
    // 입력창 수정가능하게
    nickname.disabled = false
    username.disabled = false
    email.disabled = false

    // 하단 버튼 활성화
    editAct.classList.remove("hidden")
    editBtn.classList.add("hidden")
})

// 취소버튼 클릭
cancelBtn.addEventListener("click", () => {
    // 입력창 수정 불가능
    nickname.disabled = true
    username.disabled = true
    email.disabled = true

    // 하단 버튼 비활성화
    editAct.classList.add("hidden")
    editBtn.classList.remove("hidden")

    // 서버의 기존 회원정보를 다시 불러옴
    getUser()
})

// 저장 버튼 클릭
profileForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // 수정할 회원정보
    const token = localStorage.getItem("token")
    const updateUser = {
        nickname: nickname.value.trim(),
        username: username.value.trim(),
        email: email.value.trim()
    }
    // console.log("수정할 회원정보:", updateUser)


    try {
        const response = await fetch("auth/me", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updateUser)
        })

        const data = await response.json()
        if (!response.ok) {
            alert(data.message)
            return
        }
        alert("회원정보가 수정되었습니다.")

        // 수정완료 후 입력창 잠금
        nickname.disabled = true
        username.disabled = true
        email.disabled = true

        // 하단버튼 비활성화
        editAct.classList.add("hidden")
        editBtn.classList.remove("hidden")

    } catch (error) {
        console.error("회원정보 수정 오류:", error)
        alert("회원정보 수정에 실패했습니다.")
    }
})


// 이미지 저장 변수
let selectedProfileImage = null

// 이미지 수정 버튼 클릭
profileEditBtn.addEventListener("click", () => {
    // 이미지가 아직 선택되지 않은 상태
    if (!selectedProfileImage) {
        profileImageInput.click()
        return
    }

    // 이미지가 선택된 상태라면 서버에 저장
    uploadProfileImage()
})


// 이미지 선택
profileImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0]

    if (!file) return

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 선택할 수 있습니다.")
        profileImageInput.value = ""
        return
    }

    selectedProfileImage = file

    // 선택한 이미지 미리보기
    const reader = new FileReader()

    reader.onload = (e) => {
        profileImg.src = e.target.result
        profileImg.alt = "선택한 프로필 이미지"
    }

    reader.readAsDataURL(file)

    // 연필 아이콘을 체크 아이콘으로 변경
    profileEditBtn.innerHTML = '<i class="ri-check-line"></i>'
})

// 프로필 이미지 서버 저장
async function uploadProfileImage() {
    const token = localStorage.getItem("token")

    if (!token) {
        alert("로그인이 필요합니다.")
        location.href = "/login.html"
        return
    }

    if (!selectedProfileImage) return

    const formData = new FormData()

    // 서버에서 받을 필드명
    formData.append("profileImage", selectedProfileImage)

    try {
        profileEditBtn.disabled = true

        const response = await fetch("/auth/profile-image", {
            method: "PATCH",
            headers: {Authorization: `Bearer ${token}`},
            body: formData
        })
        const data = await response.json()

        if (!response.ok) {
            alert(data.message || "프로필 이미지 저장에 실패했습니다.")
            return
        }

        alert("프로필 이미지가 저장되었습니다.")

        // 선택 상태 초기화
        selectedProfileImage = null
        profileImageInput.value = ""

        // 체크 아이콘을 다시 연필 아이콘으로 변경
        profileEditBtn.innerHTML = '<i class="ri-pencil-line"></i>'

    } catch (error) {
        console.error("프로필 이미지 저장 오류:", error)
        alert("프로필 이미지 저장에 실패했습니다.")

    } finally {
        profileEditBtn.disabled = false
    }
}