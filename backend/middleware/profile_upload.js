import multer from "multer"
import path from "path"
import fs from "fs"

// 현재 실행 중인 프로젝트 기준 절대 경로 생성
const uploadPath = path.resolve("public", "uploads", "profile")

// 폴더가 없으면 자동 생성
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
}

// 파일 저장방식 설정
const storage = multer.diskStorage({
    // 폴더 설정
    destination: (req, file, callback) => {
        // callback(null, "public/uploads/profile")
        callback(null, uploadPath)
    },

    // 파일 이름 설정
    filename: (req, file, callback) => {
        // 원본 파일 확장자 추출
        const extension = path.extname(file.originalname)

        // 현재 시간을 이용 파일명 생성
        const filename = `${Date.now()}${extension}`

        callback(null, filename)
    }
})

// 이미지 업로드 미들웨어
export const uploadProfile = multer({
    storage,  // 파일 저장 방식 설정

    // 최대 파일 크기: 5MB
    limits: {
        fileSize: 5 * 1024 * 1024
    },

    // 업로드 파일 검사
    fileFilter: (req, file, callback) => {
        // 업로드된 파일의 타입(MIME Type)이 image/로 시작하는지 확인
        // image/png 또는 image/jpeg → 허용
        // application/pdf → 거부
        if (file.mimetype.startsWith("image/")) {
            // 검사 통과 → 업로드 허용
            callback(null, true)
        } else {
            // 검사 실패 → 업로드 거부
            callback(
                new Error("이미지 파일만 업로드할 수 있습니다."),
                false
            )
        }
    }
})
