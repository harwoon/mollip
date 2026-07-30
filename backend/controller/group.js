import express from "express";
import * as groupRepository from "../repository/group.js";
import { assignWeeklyGroups } from "../service/weeklyGroupService.js";
import * as statisticsService from "../service/statisticsService.js";

// 그룹 목록 조회 (확인용)
export async function getGroups(req, res) {
  try {
    const groups = await groupRepository.findAllGroups();

    return res.status(200).json({
      message: "그룹 목록을 성공적으로 불러왔습니다.",
      groups,
    });
  } catch (error) {
    console.error("그룹 목록 조회 오류: ", error);
    return res.status(500).json({
      message: "그룹 목록 조회 중 오류가 발생했습니다.",
    });
  }
}

// 그룹 이름, 색상 조회
export async function getGroupsColor(req, res) {
  const { id } = req.params;
  try {
    const groups = await groupRepository.findAllGroups();

    const groupList = groups.map((group) => ({
      groupName: group.groupName,
      groupColor: group.groupColor,
    }));

    return res.status(200).json({
      message: "그룹 목록을 성공적으로 불러왔습니다.",
      groups: groupList,
    });
  } catch (error) {
    console.error("그룹 목록 조회 오류: ", error);
    return res.status(500).json({
      message: "그룹 목록 조회 중 오류가 발생했습니다.",
    });
  }
}

// 그룹 개수 조회
export async function getGroupGount(req, res) {
  try {
    const count = await groupRepository.countGroups();
    return res.status(200).json({
      message: "그룹 수를 성공적으로 불러왔습니다.",
      count,
    });
  } catch (error) {
    console.error("그룹 수 조회 오류: ", error);
    return res.status(500).json({
      message: "그룹 수 조회 중 오류가 발생했습니다.",
    });
  }
}

// 자신 그룹 조회
export async function getGroup(req, res) {
  const groupId = req.user.groupId;

  try {
    const group = await groupRepository.findById(groupId);
    return res.status(200).json(group);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버 오류로 그룹 정보를 불러오지 못했습니다." });
  }
}

// 상위 그룹 조회
export async function getHigher(req, res) {
  const groupId = req.user.groupId;

  try {
    const myGroup = await groupRepository.findById(groupId);
    if (!myGroup) {
      return res
        .status(404)
        .json({ message: "내 그룹 정보를 찾을 수 없습니다." });
    }

    const currentGroupTime = myGroup.groupTime;

    const higherGroup = await groupRepository.getNextGroup(currentGroupTime);

    if (!higherGroup) {
      return res
        .status(200)
        .json({ message: "현재 최고 등급 그룹입니다.", data: null });
    }

    return res.status(200).json(higherGroup);
  } catch (error) {
    console.error("상위 그룹 조회 실패:", error);
    return res
      .status(500)
      .json({ message: "서버 오류로 상위 그룹 정보를 불러오지 못했습니다." });
  }
}

// 하위 그룹 조회
export async function getLower(req, res) {
  const groupId = req.user.groupId;

  try {
    const myGroup = await groupRepository.findById(groupId);
    if (!myGroup) {
      return res
        .status(404)
        .json({ message: "내 그룹 정보를 찾을 수 없습니다." });
    }

    const currentGroupTime = myGroup.groupTime;

    // 2. 내 그룹 시간을 기준으로 하위 그룹을 조회합니다.
    const lowerGroup = await groupRepository.getPrevGroup(currentGroupTime);

    // 하위 그룹이 없을 경우(최하위 등급)의 처리
    if (!lowerGroup) {
      return res
        .status(200)
        .json({ message: "현재 최하위 등급 그룹입니다.", data: null });
    }

    return res.status(200).json(lowerGroup);
  } catch (error) {
    console.error("하위 그룹 조회 실패:", error);
    return res
      .status(500)
      .json({ message: "서버 오류로 하위 그룹 정보를 불러오지 못했습니다." });
  }
}

// 그룹 추가
export async function addGroup(req, res) {
  try {
    const {
      groupName,
      groupColor,
      groupTime,
      minStudyTime,
      challengeStudyTime,
      todoCompletionRate,
      attendanceDays,
    } = req.body;

    if (
      !groupName?.trim() ||
      !groupColor?.trim() ||
      groupTime === undefined ||
      groupTime === null ||
      groupTime === ""
    ) {
      return res.status(400).json({
        message: "그룹명, 그룹 컬러, 그룹 조건 시간은 필수입니다.",
      });
    }

    if (
      minStudyTime === undefined ||
      minStudyTime === null ||
      minStudyTime === "" ||
      challengeStudyTime === undefined ||
      challengeStudyTime === null ||
      challengeStudyTime === "" ||
      todoCompletionRate === undefined ||
      todoCompletionRate === null ||
      todoCompletionRate === "" ||
      attendanceDays === undefined ||
      attendanceDays === null ||
      attendanceDays === ""
    ) {
      return res.status(400).json({
        message: "그룹 목표 4개를 모두 입력해주세요.",
      });
    }

    /*
     * 문자열로 들어온 숫자를 Number로 변환
     */
    const minStudy = Number(minStudyTime);
    const challengeStudy = Number(challengeStudyTime);
    const todoRate = Number(todoCompletionRate);
    const attendance = Number(attendanceDays);
    const time = Number(groupTime);
    /*
     * 숫자 형식 검사
     */
    if (
      Number.isNaN(time) ||
      Number.isNaN(minStudy) ||
      Number.isNaN(challengeStudy) ||
      Number.isNaN(todoRate) ||
      Number.isNaN(attendance)
    ) {
      return res.status(400).json({
        message: "시간과 목표 수치는 숫자여야 합니다.",
      });
    }

    if (Number.isNaN(time)) {
      return res.status(400).json({
        message: "그룹 조건 시간은 숫자여야합니다.",
      });
    }
    if (time < 0) {
      return res.status(400).json({
        message: "그룹 조건 시간은 0 이상이어야 합니다.",
      });
    }

    const existingGroup = await groupRepository.findByGroupName(
      groupName.trim(),
    );
    if (existingGroup) {
      return res.status(409).json({
        message: "이미 사용 중인 그룹명입니다.",
      });
    }

    const existingGroupColor = await groupRepository.findByColor(groupColor);
    if (existingGroupColor) {
      return res.status(409).json({
        message: "이미 사용 중인 컬러입니다.",
      });
    }

    const existingGroupTime = await groupRepository.findByGroupTime(time);

    if (existingGroupTime) {
      return res.status(409).json({
        message: "이미 사용 중인 그룹 조건 시간입니다.",
      });
    }

    if (minStudy <= time || minStudy > 168) {
      return res.status(400).json({
        message:
          "최소 공부시간 목표는 그룹 조건 시간보다 높고 168시간 이하여야 합니다.",
      });
    }

    if (challengeStudy <= minStudy || challengeStudy > 168) {
      return res.status(400).json({
        message:
          "도전 공부시간 목표는 최소 공부시간 목표보다 높고 168시간 이하여야 합니다.",
      });
    }

    if (todoRate < 0 || todoRate > 100) {
      return res.status(400).json({
        message: "Todo 달성률 목표는 0% 이상 100% 이하여야 합니다.",
      });
    }

    if (attendance < 1 || attendance > 7) {
      return res.status(400).json({
        message: "출석일 목표는 1일 이상 7일 이하여야 합니다.",
      });
    }

    const goals = [
      {
        goalType: "MIN_STUDY_TIME",
        targetValue: minStudy,
        unit: "HOUR",
        order: 1,
      },
      {
        goalType: "CHALLENGE_STUDY_TIME",
        targetValue: challengeStudy,
        unit: "HOUR",
        order: 2,
      },
      {
        goalType: "TODO_COMPLETION_RATE",
        targetValue: todoRate,
        unit: "PERCENT",
        order: 3,
      },
      {
        goalType: "ATTENDANCE_DAYS",
        targetValue: attendance,
        unit: "DAY",
        order: 4,
      },
    ];

    const group = await groupRepository.createGroup({
      groupName: groupName.trim(),
      groupColor: groupColor.trim(),
      groupTime: time,
      goals,
    });

    return res.status(201).json({
      message: "그룹이 등록되었습니다.",
      group,
    });
  } catch (error) {
    console.error("그룹 등록 오류:", error);

    // unique 인덱스 중복 오류
    if (error.code === 11000) {
      return res.status(409).json({
        message: "그룹명, 그룹 컬러 또는 그룹 조건 시간이 중복되었습니다.",
      });
    }

    return res.status(500).json({
      message: "그룹 등록 중 오류가 발생했습니다.",
    });
  }
}

// 기존 목표값 조회
function getGoalTarget(goals, goalType, fallbackValue) {
  const goal = goals?.find((goal) => goal.goalType === goalType);

  return goal?.targetValue ?? fallbackValue;
}

// 그룹 수정
export async function updateGroup(req, res) {
  try {
    const { id } = req.params;
    const {
      groupName,
      groupColor,
      groupTime,
      minStudyTime,
      challengeStudyTime,
      todoCompletionRate,
      attendanceDays,
    } = req.body || {};

    // 그룹 존재 확인
    const existingGroup = await groupRepository.findById(id);
    if (!existingGroup) {
      return res.status(404).json({
        message: "존재하지 않는 그룹입니다.",
      });
    }

    const updateData = {};

    let nextGroupTime = Number(existingGroup.groupTime);

    if (groupName !== undefined) {
      if (typeof groupName !== "string" || !groupName.trim()) {
        return res.status(400).json({
          message: "그룹명을 입력해주세요.",
        });
      }

      const trimmedGroupName = groupName.trim();

      const duplicateName = await groupRepository.findByGroupNameExcludingId(
        trimmedGroupName,
        id,
      );

      if (duplicateName) {
        return res.status(409).json({
          message: "이미 사용 중인 그룹명입니다.",
        });
      }

      updateData.groupName = trimmedGroupName;
    }

    // 그룹 컬러
    if (groupColor !== undefined) {
      if (typeof groupColor !== "string" || !groupColor.trim()) {
        return res.status(400).json({
          message: "그룹 컬러를 입력해주세요.",
        });
      }

      const trimmedGroupColor = groupColor.trim();

      const duplicateColor = await groupRepository.findByGroupColorExcludingId(
        trimmedGroupColor,
        id,
      );

      if (duplicateColor) {
        return res.status(409).json({
          message: "이미 사용 중인 그룹 컬러입니다.",
        });
      }

      updateData.groupColor = trimmedGroupColor;
    }

    // 그룹 조건 시간
    if (groupTime !== undefined) {
      if (groupTime === null || groupTime === "") {
        return res.status(400).json({
          message: "그룹 조건 시간을 입력해주세요.",
        });
      }

      const time = Number(groupTime);

      if (Number.isNaN(time)) {
        return res.status(400).json({
          message: "그룹 조건 시간은 숫자여야 합니다.",
        });
      }

      if (time < 0 || time >= 168) {
        return res.status(400).json({
          message: "그룹 조건 시간은 0 이상 168시간 미만이어야 합니다.",
        });
      }

      const duplicateTime = await groupRepository.findByGroupTimeExcludingId(
        time,
        id,
      );

      if (duplicateTime) {
        return res.status(409).json({
          message: "이미 사용 중인 그룹 조건 시간입니다.",
        });
      }

      nextGroupTime = time;
      updateData.groupTime = time;
    }

    // 기존 목표값 조회
    let nextMinStudyTime = getGoalTarget(
      existingGroup.goals,
      "MIN_STUDY_TIME",
      nextGroupTime + 1,
    );

    let nextChallengeStudyTime = getGoalTarget(
      existingGroup.goals,
      "CHALLENGE_STUDY_TIME",
      Math.min(nextGroupTime + 10, 168),
    );

    let nextTodoCompletionRate = getGoalTarget(
      existingGroup.goals,
      "TODO_COMPLETION_RATE",
      50,
    );

    let nextAttendanceDays = getGoalTarget(
      existingGroup.goals,
      "ATTENDANCE_DAYS",
      3,
    );
    //목표 중 하나라도 수정 요청이 들어왔는지 확인
    const hasGoalUpdate = [
      minStudyTime,
      challengeStudyTime,
      todoCompletionRate,
      attendanceDays,
    ].some((value) => value !== undefined);

    //최소 공부시간 목표 수정
    if (minStudyTime !== undefined) {
      if (minStudyTime === null || minStudyTime === "") {
        return res.status(400).json({
          message: "최소 공부시간 목표를 입력해주세요.",
        });
      }

      const minStudy = Number(minStudyTime);

      if (Number.isNaN(minStudy)) {
        return res.status(400).json({
          message: "최소 공부시간 목표는 숫자여야 합니다.",
        });
      }

      nextMinStudyTime = minStudy;
    }

    //도전 공부시간 목표 수정
    if (challengeStudyTime !== undefined) {
      if (challengeStudyTime === null || challengeStudyTime === "") {
        return res.status(400).json({
          message: "도전 공부시간 목표를 입력해주세요.",
        });
      }

      const challengeStudy = Number(challengeStudyTime);

      if (Number.isNaN(challengeStudy)) {
        return res.status(400).json({
          message: "도전 공부시간 목표는 숫자여야 합니다.",
        });
      }

      nextChallengeStudyTime = challengeStudy;
    }

    /*
     * Todo 달성률 목표 수정
     */
    if (todoCompletionRate !== undefined) {
      if (todoCompletionRate === null || todoCompletionRate === "") {
        return res.status(400).json({
          message: "Todo 달성률 목표를 입력해주세요.",
        });
      }

      const todoRate = Number(todoCompletionRate);

      if (Number.isNaN(todoRate)) {
        return res.status(400).json({
          message: "Todo 달성률 목표는 숫자여야 합니다.",
        });
      }

      nextTodoCompletionRate = todoRate;
    }

    /*
     * 출석일 목표 수정
     */
    if (attendanceDays !== undefined) {
      if (attendanceDays === null || attendanceDays === "") {
        return res.status(400).json({
          message: "출석일 목표를 입력해주세요.",
        });
      }

      const attendance = Number(attendanceDays);

      if (Number.isNaN(attendance)) {
        return res.status(400).json({
          message: "출석일 목표는 숫자여야 합니다.",
        });
      }

      nextAttendanceDays = attendance;
    }

    /*
     * 목표와 그룹 조건 시간 사이의 관계 검사
     *
     * groupTime만 수정된 경우에도
     * 기존 목표와 충돌하는지 검사
     */
    if (nextMinStudyTime <= nextGroupTime || nextMinStudyTime > 168) {
      return res.status(400).json({
        message:
          "최소 공부시간 목표는 그룹 조건 시간보다 높고 168시간 이하여야 합니다.",
      });
    }

    if (
      nextChallengeStudyTime <= nextMinStudyTime ||
      nextChallengeStudyTime > 168
    ) {
      return res.status(400).json({
        message:
          "도전 공부시간 목표는 최소 공부시간 목표보다 높고 168시간 이하여야 합니다.",
      });
    }

    if (nextTodoCompletionRate < 0 || nextTodoCompletionRate > 100) {
      return res.status(400).json({
        message: "Todo 달성률 목표는 0% 이상 100% 이하여야 합니다.",
      });
    }

    if (
      !Number.isInteger(nextAttendanceDays) ||
      nextAttendanceDays < 1 ||
      nextAttendanceDays > 7
    ) {
      return res.status(400).json({
        message: "출석일 목표는 1일 이상 7일 이하의 정수여야 합니다.",
      });
    }

    /*
     * 목표 수정 요청이 들어온 경우
     * 목표 배열 전체를 새로운 값으로 교체
     */
    if (hasGoalUpdate) {
      updateData.goals = [
        {
          goalType: "MIN_STUDY_TIME",
          targetValue: nextMinStudyTime,
          unit: "HOUR",
          order: 1,
        },
        {
          goalType: "CHALLENGE_STUDY_TIME",
          targetValue: nextChallengeStudyTime,
          unit: "HOUR",
          order: 2,
        },
        {
          goalType: "TODO_COMPLETION_RATE",
          targetValue: nextTodoCompletionRate,
          unit: "PERCENT",
          order: 3,
        },
        {
          goalType: "ATTENDANCE_DAYS",
          targetValue: nextAttendanceDays,
          unit: "DAY",
          order: 4,
        },
      ];
    }

    // 아무 값도 전달되지 않은 경우
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "수정할 내용이 없습니다.",
      });
    }

    const updatedGroup = await groupRepository.updateGroupById(id, updateData);

    return res.status(200).json({
      message: "그룹이 수정되었습니다.",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("그룹 수정 오류: ", error);

    // unique 인덱스 중복 오류
    if (error.code === 11000) {
      return res.status(409).json({
        message: "그룹명, 그룹 컬러 또는 그룹 조건 시간이 중복되었습니다.",
      });
    }

    return res.status(500).json({
      message: "그룹 수정 중 오류가 발생했습니다.",
    });
  }
}

export async function runWeeklyGroupAssignment(req, res, next) {
  try {
    const result = await assignWeeklyGroups();

    return res.status(200).json({
      message: "주간 그룹 배정이 완료되었습니다.",
      result,
    });
  } catch (error) {
    next(error);
  }
}

// 그룹 랭킹
export async function getWeeklyRanking(req, res) {
  try {
    const ranking = await statisticsService.getWeeklyGroupRanking(req.user._id);

    res.status(200).json({
      ranking,
    });
  } catch (error) {
    console.error("주간 랭킹 조회 실패:", error);

    res.status(500).json({
      message: error.message,
    });
  }
}
