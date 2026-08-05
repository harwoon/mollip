import fs from "fs"
import path from "path"

import { getMemberStatusMailTemplate }
    from "./util/memberStatusMailTemplates.js"

// 확인하고 싶은 메일 타입
const mail = getMemberStatusMailTemplate(
    "inactive7",   // inactive7 / inactive14 / dormant
    "홍길동"
)

// preview.html 생성
const outputPath = path.join(
    process.cwd(),
    "preview.html"
)

fs.writeFileSync(
    outputPath,
    mail.html,
    "utf-8"
)

console.log("생성 완료")
console.log(outputPath)