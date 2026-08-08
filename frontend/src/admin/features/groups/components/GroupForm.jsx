import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";

import {
    createGroup,
    updateGroup,
} from "../api/group.js";

import "./GroupForm.css";

/*
 * 그룹 goals 배열에서
 * 원하는 목표의 targetValue 가져오기
 */
function getGoalTarget(
    goals,
    goalType,
    fallbackValue,
) {
    const goal = goals?.find(
        (goal) => goal.goalType === goalType,
    );

    return goal?.targetValue ?? fallbackValue;
}

/*
 * 그룹 조건 시간을 시간 단위로 반환
 *
 * 통계 API:
 * groupConditionHours = 시간
 * groupTime = 초
 */
function getGroupTimeHours(group) {
    /*
     * 통계 API가 내려준 시간 단위 값이 있으면 우선 사용
     */
    if (
        group?.groupConditionHours !== undefined &&
        group?.groupConditionHours !== null
    ) {
        return (
            Number(group.groupConditionHours) || 0
        );
    }

    /*
     * groupConditionHours가 없다면
     * groupTime을 초에서 시간으로 변환
     */
    const groupTimeSeconds =
        Number(group?.groupTime) || 0;

    return groupTimeSeconds / 3600;
}

export default function GroupForm({
    mode,
    group,
    onSuccess,
    onCancel,
}) {
    const [groupName, setGroupName] =
        useState("");

    const [groupColor, setGroupColor] =
        useState("#FFFFFF");

    const [groupTime, setGroupTime] =
        useState("");

    /*
     * 목표 4개
     */
    const [
        minStudyTime,
        setMinStudyTime,
    ] = useState("");

    const [
        challengeStudyTime,
        setChallengeStudyTime,
    ] = useState("");

    const [
        todoCompletionRate,
        setTodoCompletionRate,
    ] = useState("50");

    const [
        attendanceDays,
        setAttendanceDays,
    ] = useState("3");

    const [showPicker, setShowPicker] =
        useState(false);

    const [error, setError] =
        useState("");

    /*
     * 수정 모드:
     * 기존 그룹 정보와 목표값을 입력창에 넣음
     *
     * 생성 모드:
     * 기본값으로 초기화
     */
    useEffect(() => {
        if (mode === "edit" && group) {
            /*
             * 서버의 초 단위 값을
             * 화면에서 사용할 시간 단위로 변환
             */
            const currentGroupTime =
                getGroupTimeHours(group);

            setGroupName(
                group.groupName || "",
            );

            setGroupColor(
                group.groupColor || "#FFFFFF",
            );

            /*
             * 입력창에는 시간 단위 표시
             */
            setGroupTime(
                String(currentGroupTime),
            );

            setMinStudyTime(
                String(
                    getGoalTarget(
                        group.goals,
                        "MIN_STUDY_TIME",
                        currentGroupTime + 1,
                    ),
                ),
            );

            setChallengeStudyTime(
                String(
                    getGoalTarget(
                        group.goals,
                        "CHALLENGE_STUDY_TIME",
                        Math.min(
                            currentGroupTime + 10,
                            168,
                        ),
                    ),
                ),
            );

            setTodoCompletionRate(
                String(
                    getGoalTarget(
                        group.goals,
                        "TODO_COMPLETION_RATE",
                        50,
                    ),
                ),
            );

            setAttendanceDays(
                String(
                    getGoalTarget(
                        group.goals,
                        "ATTENDANCE_DAYS",
                        3,
                    ),
                ),
            );
        } else {
            /*
             * 생성 모드 기본값
             */
            setGroupName("");
            setGroupColor("#FFFFFF");
            setGroupTime("");

            setMinStudyTime("");
            setChallengeStudyTime("");

            setTodoCompletionRate("50");
            setAttendanceDays("3");
        }

        setShowPicker(false);
        setError("");
    }, [mode, group]);

    /*
     * 그룹 조건 시간이 변경되면
     * 기본 목표 시간을 자동 계산
     *
     * 예:
     * 그룹 조건 30시간
     * 최소 목표 31시간
     * 도전 목표 40시간
     */
    function handleGroupTimeChange(event) {
        const value = event.target.value;

        setGroupTime(value);

        if (value === "") {
            setMinStudyTime("");
            setChallengeStudyTime("");
            return;
        }

        const time = Number(value);

        if (Number.isNaN(time)) {
            return;
        }

        setMinStudyTime(
            String(time + 1),
        );

        setChallengeStudyTime(
            String(
                Math.min(time + 10, 168),
            ),
        );
    }

    /*
     * 그룹 생성 또는 수정
     */
    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        /*
         * 빈 값 검사
         */
        if (
            !groupName.trim() ||
            !groupColor.trim() ||
            groupTime === "" ||
            minStudyTime === "" ||
            challengeStudyTime === "" ||
            todoCompletionRate === "" ||
            attendanceDays === ""
        ) {
            setError(
                "그룹 정보와 목표를 모두 입력해주세요.",
            );

            return;
        }

        /*
        * 컬러코드 형식 검사
        */
        const colorPattern = /^#[0-9A-F]{6}$/i;

        if (!colorPattern.test(groupColor)) {
            setError(
                "컬러코드는 #RRGGBB 형식으로 입력해주세요."
            );
            return;
        }

        const time = Number(groupTime)
        const minStudy = Number(minStudyTime)
        const challengeStudy = Number(challengeStudyTime)
        const todoRate = Number(todoCompletionRate)
        const attendance = Number(attendanceDays)

        /*
         * 숫자 검사
         */
        if (
            Number.isNaN(time) ||
            Number.isNaN(minStudy) ||
            Number.isNaN(challengeStudy) ||
            Number.isNaN(todoRate) ||
            Number.isNaN(attendance)
        ) {
            setError(
                "시간과 목표값은 숫자로 입력해주세요.",
            );

            return;
        }

        /*
         * 그룹 조건 시간 검사
         */
        if (time < 0 || time >= 168) {
            setError(
                "그룹 조건 시간은 0 이상 168시간 미만이어야 합니다.",
            );

            return;
        }

        /*
         * 최소 공부시간 목표 검사
         */
        if (
            minStudy <= time ||
            minStudy > 168
        ) {
            setError(
                "최소 공부시간 목표는 그룹 조건 시간보다 높고 168시간 이하여야 합니다.",
            );

            return;
        }

        /*
         * 도전 공부시간 목표 검사
         */
        if (
            challengeStudy <= minStudy ||
            challengeStudy > 168
        ) {
            setError(
                "도전 공부시간 목표는 최소 공부시간 목표보다 높고 168시간 이하여야 합니다.",
            );

            return;
        }

        /*
         * Todo 달성률 검사
         */
        if (
            todoRate < 0 ||
            todoRate > 100
        ) {
            setError(
                "Todo 달성률 목표는 0% 이상 100% 이하여야 합니다.",
            );

            return;
        }

        /*
         * 출석일 검사
         */
        if (
            !Number.isInteger(attendance) ||
            attendance < 1 ||
            attendance > 7
        ) {
            setError(
                "출석일 목표는 1일 이상 7일 이하의 정수여야 합니다.",
            );

            return;
        }

        /*
         * 백엔드에 전달할 데이터
         *
         * groupTime은 시간 단위로 전달
         * 백엔드에서 초로 변환해서 저장
         */
        const groupData = {
            groupName:
                groupName.trim(),

            groupColor:
                groupColor.trim(),

            groupTime:
                time,

            minStudyTime:
                minStudy,

            challengeStudyTime:
                challengeStudy,

            todoCompletionRate:
                todoRate,

            attendanceDays:
                attendance,
        };

        try {
            if (mode === "edit") {
                await updateGroup(
                    group._id,
                    groupData,
                );

                alert(
                    "그룹이 수정되었습니다.",
                );
            } else {
                await createGroup(
                    groupData,
                );

                alert(
                    "그룹이 생성되었습니다.",
                );
            }

            await onSuccess();
        } catch (error) {
            console.error(
                "그룹 저장 오류:",
                error,
            );

            const message =
                error.response?.data?.message ||
                error.message ||
                "그룹 저장에 실패했습니다.";

            setError(message);
            alert(message);
        }
    }

    return (
        <form
            className="groupForm"
            onSubmit={handleSubmit}
        >
            <h2>
                {mode === "edit"
                    ? "그룹 수정하기"
                    : "그룹 생성하기"}
            </h2>

            <div className="groupFormField">
                <label htmlFor="groupName">
                    그룹명
                </label>

                <input
                    id="groupName"
                    type="text"
                    value={groupName}
                    placeholder="그룹명을 입력하세요."
                    onChange={(event) =>
                        setGroupName(
                            event.target.value,
                        )
                    }
                />
            </div>

            <div className="groupFormField colorField">
                <label>
                    그룹 대표 컬러
                </label>

                <div className="colorFieldRow">
                    <button
                        type="button"
                        className="colorSwatch"
                        style={{
                            backgroundColor: groupColor,
                        }}
                        onClick={() =>
                            setShowPicker((previous) => !previous)
                        }
                    />

                    <input
                        type="text"
                        className="colorCodeInput"
                        value={groupColor}
                        placeholder="#FFFFFF"
                        maxLength={7}
                        onChange={(event) => {
                            let value = event.target.value.toUpperCase();

                            // # 자동 추가
                            if (value && !value.startsWith("#")) {
                                value = "#" + value;
                            }

                            // 최대 7글자
                            value = value.slice(0, 7);

                            // 입력 중에는 그대로 표시
                            setGroupColor(value);
                        }}
                    />
                </div>

                {showPicker && (
                    <div className="colorPickerPopover">
                        <HexColorPicker
                            color={groupColor}
                            onChange={setGroupColor}
                        />
                    </div>
                )}
            </div>

            <div className="groupFormField">
                <label htmlFor="groupTime">
                    그룹 조건 시간(h)
                </label>

                <input
                    id="groupTime"
                    type="number"
                    min="0"
                    max="167"
                    step="1"
                    value={groupTime}
                    placeholder="그룹 조건 시간을 입력하세요."
                    onChange={
                        handleGroupTimeChange
                    }
                />

                <p className="groupFormHelp">
                    사용자의 총 공부시간을 기준으로
                    그룹이 배정됩니다.
                </p>
            </div>

            <section className="groupGoalSection">
                <h3>그룹 목표 설정</h3>

                <div className="groupGoalGrid">
                    <div className="groupFormField">
                        <label htmlFor="minStudyTime">
                            최소 공부시간 목표
                        </label>

                        <div className="numberInputRow">
                            <input
                                id="minStudyTime"
                                type="number"
                                min="0"
                                max="168"
                                value={minStudyTime}
                                onChange={(event) =>
                                    setMinStudyTime(
                                        event.target.value,
                                    )
                                }
                            />

                            <span>시간</span>
                        </div>

                        <p className="groupFormHelp">
                            그룹 조건 시간보다
                            높아야 합니다.
                        </p>
                    </div>

                    <div className="groupFormField">
                        <label htmlFor="challengeStudyTime">
                            도전 공부시간 목표
                        </label>

                        <div className="numberInputRow">
                            <input
                                id="challengeStudyTime"
                                type="number"
                                min="0"
                                max="168"
                                value={
                                    challengeStudyTime
                                }
                                onChange={(event) =>
                                    setChallengeStudyTime(
                                        event.target.value,
                                    )
                                }
                            />

                            <span>시간</span>
                        </div>

                        <p className="groupFormHelp">
                            최소 공부시간 목표보다
                            높아야 합니다.
                        </p>
                    </div>

                    <div className="groupFormField">
                        <label htmlFor="todoCompletionRate">
                            Todo 달성률 목표
                        </label>

                        <div className="numberInputRow">
                            <input
                                id="todoCompletionRate"
                                type="number"
                                min="0"
                                max="100"
                                value={
                                    todoCompletionRate
                                }
                                onChange={(event) =>
                                    setTodoCompletionRate(
                                        event.target.value,
                                    )
                                }
                            />

                            <span>%</span>
                        </div>
                    </div>

                    <div className="groupFormField">
                        <label htmlFor="attendanceDays">
                            출석일 목표
                        </label>

                        <div className="numberInputRow">
                            <input
                                id="attendanceDays"
                                type="number"
                                min="1"
                                max="7"
                                step="1"
                                value={
                                    attendanceDays
                                }
                                onChange={(event) =>
                                    setAttendanceDays(
                                        event.target.value,
                                    )
                                }
                            />

                            <span>일</span>
                        </div>
                    </div>
                </div>
            </section>

            {error && (
                <p className="groupFormError">
                    {error}
                </p>
            )}

            <div className="groupFormActions">
                <button
                    type="button"
                    onClick={onCancel}
                >
                    취소
                </button>

                <button type="submit">
                    {mode === "edit"
                        ? "수정 완료"
                        : "그룹 생성"}
                </button>
            </div>
        </form>
    );
}