// 공통 메일 HTML 레이아웃 생성
function createMailLayout({
    title,
    nickname,
    message,
    buttonText,
    buttonUrl
}) {
    return `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
        </head>

        <body
            style="
                margin: 0;
                padding: 30px;
                background: #f5f5f7;
                font-family: Arial, sans-serif;
                color: #333;
            "
        >
            <div
                style="
                    max-width: 560px;
                    margin: 0 auto;
                    padding: 35px;
                    background: #ffffff;
                    border-radius: 15px;
                "
            >
                <h1
                    style="
                        margin: 0 0 20px;
                        color: #7657c8;
                        font-size: 24px;
                    "
                >
                    Mollip
                </h1>

                <h2
                    style="
                        margin: 0 0 20px;
                        font-size: 20px;
                    "
                >
                    ${title}
                </h2>

                <p
                    style="
                        margin: 0 0 15px;
                        line-height: 1.7;
                    "
                >
                    ${nickname}님, 안녕하세요.
                </p>

                <div
                    style="
                        margin-bottom: 25px;
                        line-height: 1.7;
                    "
                >
                    ${message}
                </div>

                <a
                    href="${buttonUrl}"
                    style="
                        display: inline-block;
                        padding: 12px 20px;
                        background: #7657c8;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    "
                >
                    ${buttonText}
                </a>
            </div>
        </body>
        </html>
    `
}


// 회원 상태별 메일 양식 반환
export function getMemberStatusMailTemplate(
    type,
    nickname
) {
    // 프론트 주소
    const frontendUrl =
        process.env.FRONTEND_URL ||
        "http://localhost:5173"

    // 7일 미학습 회원 메일
    if (type === "inactive7") {
        return {
            subject:
                "[Mollip] 다시 몰입을 시작해 보세요",

            html: createMailLayout({
                title:
                    "최근 학습 기록이 기다리고 있어요.",

                nickname,

                message: `
                    <p>
                        최근 7일 동안 학습 기록이 확인되지 않았어요.
                    </p>

                    <p>
                        부담 없이 짧은 시간부터 다시 시작해 보세요.
                    </p>
                `,

                buttonText:
                    "Mollip에서 공부 시작하기",

                buttonUrl:
                    `${frontendUrl}/home`
            })
        }
    }

    // 14일 미학습 회원 메일
    if (type === "inactive14") {
        return {
            subject:
                "[Mollip] 학습 흐름을 다시 이어가 보세요",

            html: createMailLayout({
                title:
                    "학습을 쉬어간 지 14일이 지났어요.",

                nickname,

                message: `
                    <p>
                        최근 14일 동안 학습 기록이 확인되지 않았어요.
                    </p>

                    <p>
                        작은 목표부터 다시 시작해 보세요.
                    </p>
                `,

                buttonText:
                    "학습 기록 확인하기",

                buttonUrl:
                    `${frontendUrl}/records`
            })
        }
    }

    // 휴면 회원 메일
    if (type === "dormant") {
        return {
            subject:
                "[Mollip] 휴면 그룹 이동 안내",

            html: createMailLayout({
                title:
                    "휴면 그룹 이동을 안내드립니다.",

                nickname,

                message: `
                    <p>
                        마지막 학습일로부터 30일이 지나
                        휴면 그룹으로 이동되었습니다.
                    </p>

                    <p>
                        다시 Mollip에서 학습을 시작해 주세요.
                    </p>
                `,

                buttonText:
                    "Mollip 다시 시작하기",

                buttonUrl:
                    `${frontendUrl}/home`
            })
        }
    }

    // 허용하지 않은 타입 방어
    throw new Error(
        "지원하지 않는 메일 유형입니다."
    )
}