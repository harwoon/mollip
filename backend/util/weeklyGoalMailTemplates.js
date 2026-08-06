const GOAL_LABELS = {
    MIN_STUDY_TIME: "최소 공부시간",
    CHALLENGE_STUDY_TIME: "도전 공부시간",
}
function buildNextGroupGoalSection({
    currentGroupName,
    nextGroupGoalPreview,
}) {
    /*
     * 다음 그룹이 없으면 현재 그룹이 최상위 그룹
     */
    if (!nextGroupGoalPreview) {
        return `
            <div
                style="
                    margin-top: 16px;
                    padding: 20px;
                    border-radius: 12px;
                    background-color: #ecfdf5;
                "
            >
                <div
                    style="
                        font-size: 18px;
                        font-weight: 700;
                        color: #047857;
                    "
                >
                    현재 최상위 그룹 목표를
                    달성했습니다.
                </div>

                <p
                    style="
                        margin: 10px 0 0;
                        font-size: 14px;
                        color: #4b5563;
                    "
                >
                    ${escapeHtml(
            currentGroupName,
        )} 그룹의 목표를 달성했습니다.
                </p>
            </div>
        `
    }

    const targetLabel =
        nextGroupGoalPreview
            .targetSource ===
            "GROUP_GOAL"
            ? "다음 그룹 목표시간"
            : "다음 그룹 배정 기준"

    const remainingText =
        nextGroupGoalPreview
            .remainingHours > 0
            ? `${formatHours(
                nextGroupGoalPreview
                    .remainingHours,
            )} 남았습니다.`
            : "다음 그룹 목표도 달성했습니다."

    return `
        <div
            style="
                margin-top: 16px;
                padding: 20px;
                border-radius: 12px;
                background-color: #ecfdf5;
            "
        >
            <div
                style="
                    font-size: 17px;
                    font-weight: 700;
                    color: #047857;
                "
            >
                현재 그룹 목표를 달성했습니다!
            </div>

            <p
                style="
                    margin: 8px 0 0;
                    font-size: 14px;
                    color: #4b5563;
                "
            >
                ${escapeHtml(
        currentGroupName,
    )} 그룹의 목표를 달성했습니다.
            </p>
        </div>

        <div
            style="
                margin-top: 16px;
                padding: 20px;
                border: 1px solid #c7d2fe;
                border-radius: 12px;
                background-color: #eef2ff;
            "
        >
            <div
                style="
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #4f46e5;
                "
            >
                다음 그룹
            </div>

            <div
                style="
                    margin-bottom: 14px;
                    font-size: 21px;
                    font-weight: 700;
                    color: #111827;
                "
            >
                ${escapeHtml(
        nextGroupGoalPreview
            .groupName,
    )}
            </div>

            <div
                style="
                    font-size: 14px;
                    line-height: 1.8;
                    color: #4b5563;
                "
            >
                ${targetLabel}:
                <strong>
                    ${formatHours(
        nextGroupGoalPreview
            .targetValue,
    )}
                </strong>
                <br>

                현재 공부시간:
                <strong>
                    ${formatHours(
        nextGroupGoalPreview
            .currentValue,
    )}
                </strong>
                <br>

                남은 시간:
                <strong
                    style="
                        color: #4f46e5;
                    "
                >
                    ${escapeHtml(
        remainingText,
    )}
                </strong>
            </div>

            <p
                style="
                    margin: 12px 0 0;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #6b7280;
                "
            >
                실제 그룹 배정은 이번 주 최종 공부시간을
                기준으로 결정됩니다.
            </p>
        </div>
    `
}


// HTML에 회원 닉네임이나 그룹명이 들어갈 때
// 태그가 실행되지 않도록 특수문자를 변환합니다.
function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
}
function buildAssignmentSection(
    assignmentPreview,
) {
    const {
        expectedGroup,
        eligibleGroups = [],
    } = assignmentPreview

    const eligibleGroupItems =
        eligibleGroups.length > 0
            ? eligibleGroups
                .map(
                    (group) => `
                        <li
                            style="
                                margin-bottom: 8px;
                                color: #4b5563;
                            "
                        >
                            <strong>
                                ${escapeHtml(
                        group.groupName,
                    )}
                            </strong>

                            <span>
                                — ${formatHours(
                        group.requiredStudyHours,
                    )} 이상
                            </span>
                        </li>
                    `,
                )
                .join("")
            : `
                <li
                    style="
                        color: #6b7280;
                    "
                >
                    현재 공부시간으로 조건을 충족한
                    그룹이 없습니다.
                </li>
            `

    const expectedGroupHtml =
        expectedGroup
            ? `
                <strong
                    style="
                        font-size: 20px;
                        color: #4f46e5;
                    "
                >
                    ${escapeHtml(
                expectedGroup.groupName,
            )}
                </strong>
            `
            : `
                <strong
                    style="
                        color: #6b7280;
                    "
                >
                    현재 배정 가능한 그룹 없음
                </strong>
            `

    return `
        <div
            style="
                margin-top: 16px;
                padding: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                background-color: #f9fafb;
            "
        >
            <div
                style="
                    margin-bottom: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    color: #111827;
                "
            >
                현재 공부시간으로 조건을 충족한 그룹
            </div>

            <ul
                style="
                    margin: 0;
                    padding-left: 20px;
                "
            >
                ${eligibleGroupItems}
            </ul>
        </div>

        <div
            style="
                margin-top: 16px;
                padding: 20px;
                border-radius: 12px;
                background-color: #eef2ff;
            "
        >
            <div
                style="
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #4f46e5;
                "
            >
                현재 기준 예상 배정 그룹
            </div>

            ${expectedGroupHtml}

            <p
                style="
                    margin: 10px 0 0;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #6b7280;
                "
            >
                실제 그룹은 주간 집계가 끝난 뒤
                최종 공부시간에 따라 달라질 수 있습니다.
            </p>
        </div>
    `
}

// 소수 시간 값을 "7시간 30분" 형태로 변환
function formatHours(hoursValue) {
    const safeHours =
        Math.max(Number(hoursValue) || 0, 0)

    const totalMinutes =
        Math.round(safeHours * 60)

    const hours =
        Math.floor(totalMinutes / 60)

    const minutes =
        totalMinutes % 60

    if (hours === 0) {
        return `${minutes}분`
    }

    if (minutes === 0) {
        return `${hours}시간`
    }

    return `${hours}시간 ${minutes}분`
}


export function getWeeklyGoalMailTemplate({
    nickname,
    groupName,
    weekStartDate,
    weekEndDate,
    weeklyStudyHours,
    goals = [],
    currentGoalAchieved = false,
    nextGroupGoalPreview = null,
    assignmentPreview = null,
}) {
    const safeNickname =
        escapeHtml(nickname)

    const safeGroupName =
        escapeHtml(groupName)

    const frontendUrl =
        (
            process.env.FRONTEND_URL ||
            "http://localhost:5173"
        ).replace(/\/$/, "")

    const buttonUrl =
        `${frontendUrl}/records`

    const buttonText =
        "학습 현황 확인하기"

    /*
     * 현재 그룹에서 기준으로 사용할 목표
     *
     * MIN_STUDY_TIME을 우선하고,
     * 없으면 CHALLENGE_STUDY_TIME,
     * 그것도 없으면 첫 번째 목표를 사용합니다.
     */
    const mainGoal =
        goals.find(
            (goal) =>
                goal.goalType ===
                "MIN_STUDY_TIME",
        ) ||
        goals.find(
            (goal) =>
                goal.goalType ===
                "CHALLENGE_STUDY_TIME",
        ) ||
        goals[0] ||
        null

    let subject
    let title
    let message
    let highlightMessage
    let detailText

    /*
     * 1. 현재 그룹에 목표가 없는 경우
     *
     * 현재 공부시간과 예상 배정 그룹 표시
     */
    if (assignmentPreview) {
        const eligibleGroups =
            assignmentPreview
                .eligibleGroups || []

        const expectedGroup =
            assignmentPreview
                .expectedGroup || null

        const expectedGroupName =
            expectedGroup?.groupName ||
            "현재 배정 가능한 그룹 없음"

        const eligibleGroupHtml =
            eligibleGroups.length > 0
                ? eligibleGroups
                    .map(
                        (group) => `
                            <li
                                style="
                                    margin-bottom: 8px;
                                "
                            >
                                <strong
                                    style="
                                        color: #7657c8;
                                    "
                                >
                                    ${escapeHtml(
                            group.groupName,
                        )}
                                </strong>

                                <span>
                                    —
                                    ${formatHours(
                            group
                                .requiredStudyHours,
                        )}
                                    이상
                                </span>
                            </li>
                        `,
                    )
                    .join("")
                : `
                    <li>
                        현재 공부시간으로 조건을
                        충족한 그룹이 없습니다.
                    </li>
                `

        const eligibleGroupText =
            eligibleGroups.length > 0
                ? eligibleGroups
                    .map(
                        (group) =>
                            `- ${group.groupName}: ` +
                            `${formatHours(
                                group
                                    .requiredStudyHours,
                            )} 이상`,
                    )
                    .join("\n")
                : "- 현재 조건을 충족한 그룹이 없습니다."

        subject =
            `[Mollip] 현재 기준 예상 배정 그룹은 ` +
            `${expectedGroupName}입니다`

        title =
            "이번 주 그룹 배정 예상 안내"

        message = `
            <p
                style="
                    margin: 0 0 18px;
                "
            >
                현재 소속된
                <strong
                    style="
                        color: #7657c8;
                    "
                >
                    ${safeGroupName}
                </strong>
                그룹에는 별도의 공부시간 목표가
                등록되어 있지 않습니다.
            </p>

            <div
                style="
                    margin-bottom: 18px;
                    padding: 17px 20px;
                    background: #f7f4ff;
                    border: 1px solid #e5ddfa;
                    border-radius: 13px;
                "
            >
                <div
                    style="
                        margin-bottom: 6px;
                        color: #756b80;
                        font-size: 13px;
                    "
                >
                    ${escapeHtml(
            weekStartDate,
        )}
                    ~
                    ${escapeHtml(
            weekEndDate,
        )}
                </div>

                <div
                    style="
                        color: #292531;
                        font-size: 17px;
                        font-weight: 700;
                    "
                >
                    이번 주 현재 공부시간:
                    ${formatHours(
            weeklyStudyHours,
        )}
                </div>
            </div>

            <p
                style="
                    margin: 0 0 10px;
                    font-weight: 700;
                    color: #40384d;
                "
            >
                현재 공부시간으로 조건을 충족한 그룹
            </p>

            <ul
                style="
                    margin: 0;
                    padding-left: 22px;
                "
            >
                ${eligibleGroupHtml}
            </ul>
        `

        highlightMessage = `
            현재 기준 예상 배정 그룹은
            <strong>
                ${escapeHtml(
            expectedGroupName,
        )}
            </strong>
            입니다.
            <br>

            <span
                style="
                    font-size: 12px;
                    color: #8b7437;
                "
            >
                실제 그룹은 이번 주 최종 공부시간에
                따라 달라질 수 있습니다.
            </span>
        `

        detailText = `
현재 소속 그룹: ${groupName}
기간: ${weekStartDate} ~ ${weekEndDate}
이번 주 현재 공부시간: ${formatHours(
            weeklyStudyHours,
        )}

현재 공부시간으로 조건을 충족한 그룹:
${eligibleGroupText}

현재 기준 예상 배정 그룹:
${expectedGroupName}

※ 실제 그룹은 이번 주 최종 공부시간에 따라 달라질 수 있습니다.
        `.trim()
    }

    /*
     * 2. 현재 그룹 목표 달성
     *    + 다음 그룹이 있는 경우
     */
    else if (
        currentGoalAchieved &&
        nextGroupGoalPreview
    ) {
        const nextGroupName =
            nextGroupGoalPreview
                .groupName

        const remainingHours =
            Number(
                nextGroupGoalPreview
                    .remainingHours,
            ) || 0

        const remainingText =
            remainingHours > 0
                ? `${formatHours(
                    remainingHours,
                )} 남았습니다.`
                : "다음 그룹 목표도 달성했습니다."

        subject =
            remainingHours > 0
                ? `[Mollip] ${nextGroupName} 목표까지 ` +
                `${formatHours(
                    remainingHours,
                )} 남았습니다`
                : `[Mollip] ${nextGroupName} 목표도 달성했습니다`

        title =
            `${safeGroupName} 그룹 목표를 달성했습니다!`

        message = `
            <p
                style="
                    margin: 0 0 18px;
                "
            >
                이번 주
                <strong
                    style="
                        color: #7657c8;
                    "
                >
                    ${safeGroupName}
                </strong>
                그룹의 목표를 달성했습니다.
            </p>

            <div
                style="
                    margin-bottom: 18px;
                    padding: 18px 20px;
                    background: #f7f4ff;
                    border: 1px solid #e5ddfa;
                    border-radius: 13px;
                "
            >
                <div
                    style="
                        margin-bottom: 10px;
                        color: #7657c8;
                        font-size: 13px;
                        font-weight: 700;
                    "
                >
                    다음 그룹
                </div>

                <div
                    style="
                        margin-bottom: 14px;
                        color: #292531;
                        font-size: 21px;
                        font-weight: 800;
                    "
                >
                    ${escapeHtml(
            nextGroupName,
        )}
                </div>

                <div
                    style="
                        color: #55505f;
                        font-size: 14px;
                        line-height: 1.8;
                    "
                >
                    다음 그룹 목표시간:
                    <strong>
                        ${formatHours(
            nextGroupGoalPreview
                .targetValue,
        )}
                    </strong>
                    <br>

                    이번 주 현재 공부시간:
                    <strong>
                        ${formatHours(
            weeklyStudyHours,
        )}
                    </strong>
                </div>
            </div>

            <p
                style="
                    margin: 0;
                "
            >
                현재 공부시간을 기준으로 다음 그룹 목표까지
                조금만 더 공부하면 됩니다.
            </p>
        `

        highlightMessage = `
            <strong>
                ${escapeHtml(
            nextGroupName,
        )}
            </strong>
            그룹 목표 달성까지
            <strong>
                ${remainingText}
            </strong>
        `

        detailText = `
현재 ${groupName} 그룹의 목표를 달성했습니다.

다음 그룹: ${nextGroupName}
다음 그룹 목표시간: ${formatHours(
            nextGroupGoalPreview
                .targetValue,
        )}
이번 주 현재 공부시간: ${formatHours(
            weeklyStudyHours,
        )}
다음 그룹 목표까지: ${remainingText}

※ 실제 그룹 배정은 이번 주 최종 공부시간을 기준으로 결정됩니다.
        `.trim()
    }

    /*
     * 3. 현재 그룹 목표 달성
     *    + 다음 그룹이 없는 경우
     */
    else if (currentGoalAchieved) {
        subject =
            `[Mollip] ${groupName} 최상위 그룹 목표를 달성했습니다`

        title =
            "최상위 그룹 목표를 달성했습니다!"

        message = `
            <p
                style="
                    margin: 0 0 18px;
                "
            >
                이번 주
                <strong
                    style="
                        color: #7657c8;
                    "
                >
                    ${safeGroupName}
                </strong>
                그룹의 목표를 달성했습니다.
            </p>

            <div
                style="
                    padding: 18px 20px;
                    background: #f7f4ff;
                    border: 1px solid #e5ddfa;
                    border-radius: 13px;
                "
            >
                <div
                    style="
                        color: #292531;
                        font-size: 17px;
                        font-weight: 700;
                    "
                >
                    이번 주 현재 공부시간:
                    ${formatHours(
            weeklyStudyHours,
        )}
                </div>
            </div>
        `

        highlightMessage = `
            현재 그룹은 최상위 그룹입니다.
            <br>
            이번 주 목표 달성을 축하합니다!
        `

        detailText = `
현재 ${groupName} 그룹의 목표를 달성했습니다.

이번 주 현재 공부시간: ${formatHours(
            weeklyStudyHours,
        )}

현재 그룹은 최상위 그룹이므로 다음 그룹이 없습니다.
        `.trim()
    }

    /*
     * 4. 현재 그룹 목표 미달성
     */
    else {
        const remainingHours =
            Number(
                mainGoal?.remainingHours,
            ) || 0

        const targetValue =
            Number(
                mainGoal?.targetValue,
            ) || 0

        const goalLabel =
            GOAL_LABELS[
            mainGoal?.goalType
            ] ||
            "공부시간 목표"

        subject =
            `[Mollip] ${groupName} 목표까지 ` +
            `${formatHours(
                remainingHours,
            )} 남았습니다`

        title =
            `${safeGroupName} 그룹 목표 안내`

        message = `
            <p
                style="
                    margin: 0 0 18px;
                "
            >
                현재 소속된
                <strong
                    style="
                        color: #7657c8;
                    "
                >
                    ${safeGroupName}
                </strong>
                그룹의 이번 주 목표 현황입니다.
            </p>

            <div
                style="
                    padding: 18px 20px;
                    background: #f7f4ff;
                    border: 1px solid #e5ddfa;
                    border-radius: 13px;
                "
            >
                <div
                    style="
                        margin-bottom: 12px;
                        color: #7657c8;
                        font-size: 14px;
                        font-weight: 700;
                    "
                >
                    ${escapeHtml(
            goalLabel,
        )}
                </div>

                <div
                    style="
                        color: #55505f;
                        font-size: 14px;
                        line-height: 1.9;
                    "
                >
                    목표시간:
                    <strong>
                        ${formatHours(
            targetValue,
        )}
                    </strong>
                    <br>

                    이번 주 현재 공부시간:
                    <strong>
                        ${formatHours(
            weeklyStudyHours,
        )}
                    </strong>
                    <br>

                    목표까지 남은 시간:
                    <strong
                        style="
                            color: #7657c8;
                        "
                    >
                        ${formatHours(
            remainingHours,
        )}
                    </strong>
                </div>
            </div>
        `

        highlightMessage = `
            현재 그룹 목표 달성까지
            <strong>
                ${formatHours(
            remainingHours,
        )}
            </strong>
            남았습니다.
        `

        detailText = `
현재 소속 그룹: ${groupName}
기간: ${weekStartDate} ~ ${weekEndDate}

${goalLabel}
목표시간: ${formatHours(
            targetValue,
        )}
이번 주 현재 공부시간: ${formatHours(
            weeklyStudyHours,
        )}
목표까지 남은 시간: ${formatHours(
            remainingHours,
        )}
        `.trim()
    }

    const html = `
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
                font-family:
                    Arial,
                    'Noto Sans KR',
                    sans-serif;
                color: #292531;
            "
        >
            <div
                style="
                    max-width: 620px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow:
                        0 15px 40px
                        rgba(92, 67, 160, 0.15);
                "
            >
                <div
                    style="
                        padding: 32px 30px;
                        text-align: center;
                        background:
                            linear-gradient(
                                135deg,
                                #7657c8,
                                #9377e0
                            );
                    "
                >
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

                    <div
                        style="
                            width: 70px;
                            height: 4px;
                            margin: 0 auto 14px;
                            border-radius: 999px;
                            background:
                                rgba(
                                    255,
                                    255,
                                    255,
                                    0.8
                                );
                        "
                    ></div>

                    <p
                        style="
                            margin: 0;
                            color:
                                rgba(
                                    255,
                                    255,
                                    255,
                                    0.9
                                );
                            font-size: 15px;
                            line-height: 1.6;
                        "
                    >
                        오늘도 작은 몰입을 시작해 보세요.
                    </p>
                </div>

                <div
                    style="
                        padding: 42px 38px 36px;
                    "
                >
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
                            ${safeNickname}님
                        </strong>,
                        안녕하세요.
                    </div>

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
                        ${highlightMessage}
                    </div>

                    <div
                        style="
                            text-align: center;
                        "
                    >
                        <a
                            href="${escapeHtml(
        buttonUrl,
    )}"
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
                                box-shadow:
                                    0 8px 18px
                                    rgba(
                                        118,
                                        87,
                                        200,
                                        0.25
                                    );
                            "
                        >
                            ${buttonText}
                        </a>
                    </div>
                </div>

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
                    본 메일은 Mollip의 주간 학습 목표
                    안내를 위해 자동 발송되었습니다.
                </div>
            </div>
        </body>
        </html>
    `

    const text = `
${title}

${nickname}님, 안녕하세요.

${detailText}

학습 현황 확인:
${buttonUrl}
    `.trim()

    return {
        subject,
        html,
        text,
    }
}