import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Topbar from "../components/AdminTopbar.jsx";
import GroupsTable from "../features/groups/components/GroupsTable.jsx";
import GroupForm from "../features/groups/components/GroupForm.jsx";

import {
  fetchAdminGroupStatistics,
} from "../features/groups/api/adminGroupStatisticsApi.js";

import "./AdminGroupsPage.css";

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState([]);

  const [mode, setMode] = useState(null);

  const [selectedGroup, setSelectedGroup] =
    useState(null);

  const [sortField, setSortField] = useState(
    "groupConditionHours",
  );

  const [sortOrder, setSortOrder] =
    useState("desc");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  /*
   * 그룹별 주간 통계 조회
   *
   * GET /admin/groups/statistics
   */
  const loadGroupStatistics =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await fetchAdminGroupStatistics();

        console.log(
          "그룹 통계 API 응답:",
          data,
        );

        const resultGroups =
          Array.isArray(data.groups)
            ? data.groups
            : [];

        setGroups(resultGroups);
      } catch (error) {
        console.error(
          "그룹 통계 조회 실패:",
          error,
        );

        setGroups([]);

        setError(
          error.message ||
          "그룹 통계 조회에 실패했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /*
   * 화면이 처음 열릴 때 그룹 통계 조회
   */
  useEffect(() => {
    loadGroupStatistics();
  }, [loadGroupStatistics]);

  /*
   * 정렬된 그룹 목록
   */
  const sortedGroups = useMemo(() => {
    const copiedGroups = [...groups];

    copiedGroups.sort((first, second) => {
      let result = 0;

      /*
       * 그룹명은 문자열 정렬
       */
      if (sortField === "groupName") {
        result = String(
          first.groupName || "",
        ).localeCompare(
          String(second.groupName || ""),
          "ko",
        );
      } else {
        /*
         * 나머지는 숫자 정렬
         */
        const firstValue =
          Number(first[sortField]) || 0;

        const secondValue =
          Number(second[sortField]) || 0;

        result = firstValue - secondValue;
      }

      return sortOrder === "asc"
        ? result
        : -result;
    });

    return copiedGroups;
  }, [groups, sortField, sortOrder]);

  /*
   * 그룹 행 클릭
   */
  function handleSelectGroup(group) {
    /*
     * 통계 API의 groupTime은 초 단위일 수 있음
     * GroupForm에는 시간 단위로 전달
     */
    const groupTimeHours = Number(
      group.groupConditionHours ??
      (Number(group.groupTime) || 0) /
      3600,
    );

    const normalizedGroup = {
      ...group,

      /*
       * GroupForm에서 입력창에 바로 사용할 값
       */
      groupTime: groupTimeHours,

      /*
       * 그룹 목표가 없을 때 빈 배열 사용
       */
      goals: Array.isArray(group.goals)
        ? group.goals
        : [],
    };

    setSelectedGroup(normalizedGroup);
    setMode("edit");
  }

  /*
   * 그룹 생성 버튼
   */
  function handleClickCreate() {
    setSelectedGroup(null);
    setMode("create");
  }

  /*
   * 그룹 생성 또는 수정 성공
   */
  async function handleFormSuccess() {
    setMode(null);
    setSelectedGroup(null);

    /*
     * 생성·수정 후 최신 통계 다시 조회
     */
    await loadGroupStatistics();
  }

  /*
   * 폼 취소
   */
  function handleCancel() {
    setMode(null);
    setSelectedGroup(null);
  }

  return (
    <div className="adminGroupsPage">
      <Topbar
        title="그룹 관리"
        description="생성된 모든 그룹과 이번 주 통계를 관리하고 조회할 수 있습니다."
      />

      <section className="groupsPageSection">
        <div className="groupsToolbar">
          <div>
            <h2>그룹 관리하기</h2>

            <p>
              생성된 모든 그룹과 이번 주 통계를
              조회할 수 있습니다.
            </p>
          </div>

          <div className="groupsToolbarActions">
            <select
              value={sortField}
              onChange={(event) =>
                setSortField(
                  event.target.value,
                )
              }
            >
              <option value="groupConditionHours">
                그룹 조건 시간
              </option>

              <option value="groupName">
                그룹명
              </option>

              <option value="memberCount">
                인원
              </option>

              <option value="averageGoalAchievementRate">
                평균 목표 달성률
              </option>

              <option value="averageStudyHours">
                평균 공부 시간
              </option>

              <option value="averageAttendanceDays">
                평균 접속 학습일
              </option>
            </select>

            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value,
                )
              }
            >
              <option value="desc">
                내림차순
              </option>

              <option value="asc">
                오름차순
              </option>
            </select>

            <button
              type="button"
              className="createGroupButton"
              onClick={handleClickCreate}
            >
              그룹 생성하기
            </button>
          </div>
        </div>

        {error && (
          <p className="groupsPageError">
            {error}
          </p>
        )}

        <div
          className={
            mode
              ? "groupsPageContent formOpened"
              : "groupsPageContent"
          }
        >
          <div className="groupsTablePanel">
            <GroupsTable
              groups={sortedGroups}
              selectedGroupId={
                selectedGroup?._id
              }
              onSelectGroup={
                handleSelectGroup
              }
              loading={loading}
            />
          </div>

          {mode && (
            <aside className="groupFormPanel">
              <GroupForm
                mode={mode}
                group={selectedGroup}
                onSuccess={
                  handleFormSuccess
                }
                onCancel={handleCancel}
              />
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}