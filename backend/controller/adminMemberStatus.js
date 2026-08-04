// 관리회원현황 서비스 가져오기
import {getMemberStatusUsers, sendMemberStatusMails} from "../service/adminMemberStatusService.js"

// 관리회원현황 조회
export async function  getMemberStatus(req, res) {
    try{
        // 서비스 회원목록 조회
        const result = await getMemberStatusUsers()
        return res.status(200).json(result)

    }catch (error) {
        console.error(
            "관리회원현황 조회 실패:", error
        )

        return res.status(500).json({
            message:
                error.message || "관리회원현황 조회에 실패했습니다."
        })
    }
}

// 관리회원현황 메일 발송
export async function sendMemberStatusMail(req, res) {
    try {
        // 프론트에서 메일 유형과 선택 회원 ID 받기
        const {type, userIds} = req.body

        // 서비스에서 실제 메일 발송 처리
        const result = await sendMemberStatusMails({type, userIds})

        // 발송 결과 반환
        return res.status(200).json({
            message: "메일 발송 요청을 처리했습니다.",
            ...result
        })

    } catch (error) {
        console.error(
            "관리회원 메일 발송 실패:", error
        )

        // 서비스에서 지정한 상태코드가 있으면 사용
        return res
            .status(error.status || 500)
            .json({
                message:
                    error.message || "메일 발송에 실패했습니다."
            })
    }
}