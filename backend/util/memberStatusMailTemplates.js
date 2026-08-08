// 공통 메일 HTML 레이아웃 생성
function createMailLayout({
    title,
    nickname,
    message,
    buttonText,
    buttonUrl,
    imageCid = null,
    imageAlt = "Mollip 안내 이미지"
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
                padding: 40px 15px;
                background: #f3efff;
                font-family: Arial, 'Noto Sans KR', sans-serif;
                color: #292531;
            "
        >
            <!-- 메일 전체 카드 -->
            <div
                style="
                    max-width: 620px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 15px 40px rgba(92, 67, 160, 0.15);
                "
            >
                <!-- 상단 보라색 영역 -->
                <div
                    style="
                        padding: 32px 30px;
                        text-align: center;
                        background: linear-gradient(
                            135deg,
                            #7657c8,
                            #9377e0
                        );
                    "
                >
                    <!-- 문자열 로고 -->
                    <div
                        style="
                            margin-bottom: 10px;
                            color: #ffffff;
                            font-size: 42px;
                            font-weight: 800;
                            letter-spacing: -1px;
                            line-height: 1;
                        "
                    >
                        Mollip
                    </div>

                    <!-- 로고 하단 장식선 -->
                    <div
                        style="
                            width: 70px;
                            height: 4px;
                            margin: 0 auto 14px;
                            border-radius: 999px;
                            background: rgba(255, 255, 255, 0.8);
                        "
                    ></div>

                    <p
                        style="
                            margin: 0;
                            color: rgba(255, 255, 255, 0.9);
                            font-size: 15px;
                            line-height: 1.6;
                        "
                    >
                        오늘도 작은 몰입을 시작해 보세요.
                    </p>
                </div>

                <!-- 메일 이미지 -->
                ${
                    imageCid
                        ? `
                            <div
                                style="
                                    padding: 30px 30px 0;
                                    text-align: center;
                                "
                            >
                                <img
                                    src="cid:${imageCid}"
                                    alt="${imageAlt}"
                                    width="280"
                                    style="
                                        display: block;
                                        width: 100%;
                                        max-width: 280px;
                                        height: auto;
                                        margin: 0 auto;
                                        border: 0;
                                        outline: none;
                                        text-decoration: none;
                                    "
                                />
                            </div>
                        `
                        : ""
                }

                <!-- 본문 영역 -->
                <div
                    style="
                        padding: 42px 38px 36px;
                    "
                >
                    <!-- 메일 제목 -->
                    <h1
                        style="
                            margin: 0 0 30px;
                            color: #292531;
                            font-size: 25px;
                            line-height: 1.45;
                            text-align: center;
                            word-break: keep-all;
                        "
                    >
                        ${title}
                    </h1>

                    <!-- 사용자 인사 박스 -->
                    <div
                        style="
                            margin-bottom: 26px;
                            padding: 18px 20px;
                            background: #f7f4ff;
                            border: 1px solid #e5ddfa;
                            border-radius: 14px;
                            color: #4e4266;
                            font-size: 15px;
                            line-height: 1.7;
                        "
                    >
                        <strong
                            style="
                                color: #7657c8;
                                font-weight: 700;
                            "
                        >
                            ${nickname}님
                        </strong>,
                        안녕하세요.
                    </div>

                    <!-- 상태별 안내 문구 -->
                    <div
                        style="
                            margin-bottom: 28px;
                            color: #55505f;
                            font-size: 15px;
                            line-height: 1.9;
                            word-break: keep-all;
                        "
                    >
                        ${message}
                    </div>

                    <!-- 강조 안내 박스 -->
                    <div
                        style="
                            margin-bottom: 30px;
                            padding: 17px 20px;
                            background: #fff9ea;
                            border: 1px solid #f1dfad;
                            border-radius: 13px;
                            color: #6d5a29;
                            font-size: 14px;
                            line-height: 1.7;
                            word-break: keep-all;
                        "
                    >
                        꾸준한 학습으로 목표를 달성해 보세요!
                    </div>

                    <!-- 이동 버튼 -->
                    <div
                        style="
                            text-align: center;
                        "
                    >
                        <a
                            href="${buttonUrl}"
                            style="
                                display: inline-block;
                                min-width: 220px;
                                padding: 15px 24px;
                                background: #7657c8;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 12px;
                                font-size: 15px;
                                font-weight: 700;
                                text-align: center;
                                box-shadow: 0 8px 18px rgba(118, 87, 200, 0.25);
                            "
                        >
                            ${buttonText}
                        </a>
                    </div>
                </div>

                <!-- 하단 안내 -->
                <div
                    style="
                        padding: 20px 30px;
                        background: #faf8ff;
                        color: #9992a4;
                        font-size: 12px;
                        line-height: 1.6;
                        text-align: center;
                    "
                >
                    본 메일은 Mollip 회원 관리 정책에 따라 발송되었습니다.
                </div>
            </div>
        </body>
        </html>
    `
}


// 회원 상태별 메일 양식 반환
export function getMemberStatusMailTemplate(
    type,
    nickname,
    imageCid
) {
    // 프론트 주소
    const frontendUrl =
        process.env.FRONTEND_URL

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
                    <p
                        style="
                            margin: 0 0 12px;
                        "
                    >
                        최근
                        <strong
                            style="
                                color: #7657c8;
                            "
                        >
                            7일 동안
                        </strong>
                        학습 기록이 확인되지 않았어요.
                    </p>

                    <p
                        style="
                            margin: 0;
                        "
                    >
                        부담 없이 짧은 시간부터 다시 시작해 보세요.
                        오늘의 작은 학습이 새로운 흐름을 만들 수 있습니다.
                    </p>
                `,

                buttonText: "Mollip에서 공부 시작하기",
                buttonUrl: `${frontendUrl}/home`,
                imageCid,
                imageAlt: "7일 미학습 안내"
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
                    <p
                        style="
                            margin: 0 0 12px;
                        "
                    >
                        최근
                        <strong
                            style="
                                color: #7657c8;
                            "
                        >
                            14일 동안
                        </strong>
                        학습 기록이 확인되지 않았어요.
                    </p>

                    <p
                        style="
                            margin: 0;
                        "
                    >
                        기존 학습 기록을 확인하고,
                        작은 목표부터 다시 학습 흐름을 이어가 보세요.
                    </p>
                `,

                buttonText: "학습 기록 확인하기",
                buttonUrl: `${frontendUrl}/records`,
                imageCid,
                imageAlt: "14일 미학습 안내"
            })
        }
    }

    // 휴면 회원 메일
    if (type === "dormant") {
        return {
            subject:
                "[Mollip] 휴면 그룹 이동 안내",

            html: createMailLayout({
                title: "휴면 그룹 이동을 안내드립니다.",
                nickname,

                message: `
                    <p
                        style="
                            margin: 0 0 12px;
                        "
                    >
                        마지막 학습일로부터
                        <strong
                            style="
                                color: #7657c8;
                            "
                        >
                            30일
                        </strong>
                        이 지나 휴면 그룹으로 이동되었습니다.
                    </p>

                    <p
                        style="
                            margin: 0;
                        "
                    >
                        다시 Mollip에서 학습을 시작하면
                        학습 기록을 이어갈 수 있습니다.
                    </p>
                `,

                buttonText: "Mollip 다시 시작하기",
                buttonUrl: `${frontendUrl}/home`,

                // adminMemberStatusService.js의 attachments.cid와 동일해야 함
                imageCid: "mollip-dormant-image",
                imageAlt: "다시 몰입을 시작하는 Mollip 캐릭터"
            })
        }
    }

    // 허용하지 않은 타입 방어
    throw new Error(
        "지원하지 않는 메일 유형입니다."
    )
}