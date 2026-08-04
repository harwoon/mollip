// 관리회원현황 서비스 가져오기
import {getMemberStatusUsers} from "../service/adminMemberStatusService.js"

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