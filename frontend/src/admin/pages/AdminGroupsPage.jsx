import { useCallback, useEffect, useMemo, useState } from "react"
import Topbar from "../components/AdminTopbar.jsx"
import GroupsTable from "../features/groups/components/GroupsTable.jsx"
import GroupForm from "../features/groups/components/GroupForm.jsx"
import { fetchAdminGroupStatistics } from "../features/groups/api/adminGroupStatisticsApi.js"
import { runWeeklyGroupAssignment } from "../features/groups/api/group.js"
import AppAlert from "../../components/common/AppAlert.jsx"

import styles from "./AdminGroupsPage.module.css"
import layoutStyles from "../components/AdminLayout.module.css"


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

  const [assignConfirmOpen, setAssignConfirmOpen] =
    useState(false);

  const [assigning, setAssigning] =
    useState(false);

  const [assignResultAlert, setAssignResultAlert] =
    useState(null);

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
   * 주간 그룹 임의 재배치 버튼
   */
  function handleClickAssign() {
    setAssignConfirmOpen(true);
  }

  async function handleConfirmAssign() {
    setAssignConfirmOpen(false);

    try {
      setAssigning(true);

      const data = await runWeeklyGroupAssignment();
      const { totalUserCount, updateUserCount } = data.result;

      setAssignResultAlert({
        type: "success",
        title: "주간 그룹 재배치 완료",
        message: `전체 ${totalUserCount}명 중 ${updateUserCount}명의 그룹이 재배치되었습니다.`,
      });

      /*
       * 재배치 후 최신 통계 다시 조회
       */
      await loadGroupStatistics();
    } catch (error) {
      console.error(
        "주간 그룹 재배치 실패:",
        error,
      );

      setAssignResultAlert({
        type: "danger",
        title: "주간 그룹 재배치 실패",
        message:
          error.message ||
          "주간 그룹 재배치 중 오류가 발생했습니다.",
      });
    } finally {
      setAssigning(false);
    }
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
    <main className={`app-page ${layoutStyles.adminPage} ${styles.adminGroupsPage}`}>
      <div className={`app-page__inner ${layoutStyles.adminPageInner}`}>
        <Topbar
          title="그룹 현황"
          description="생성된 모든 그룹과 이번 주 통계를 관리하고 조회할 수 있습니다."
        >
          <div className={styles.groupsToolbarActions}>
            <select
              className="app-select"
              value={sortField}
              onChange={(event) => setSortField(event.target.value)}
            >
              <option value="groupConditionHours">그룹 조건 시간</option>
              <option value="groupName">그룹명</option>
              <option value="memberCount">인원</option>
              <option value="averageGoalAchievementRate">평균 목표 달성률</option>
              <option value="averageStudyHours">평균 공부 시간</option>
              <option value="averageAttendanceDays">평균 접속 학습일</option>
            </select>

            <select
              className="app-select"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>

            <button
              type="button"
              className="app-btn-secondary"
              onClick={handleClickAssign}
              disabled={assigning}
            >
              {assigning ? "재배치 중..." : "그룹 재배치"}
            </button>

            <button
              type="button"
              className="app-btn-primary"
              onClick={handleClickCreate}
            >
              그룹 생성하기
            </button>
          </div>
        </Topbar>

        <section className={styles.groupsPageSection}>
          {error && <p className={styles.groupsPageError}>{error}</p>}

          <div className={mode ? `${styles.groupsPageContent} ${styles.formOpened}` : styles.groupsPageContent}>
            <div className={styles.groupsTablePanel}>
              <GroupsTable
                groups={sortedGroups}
                selectedGroupId={selectedGroup?._id}
                onSelectGroup={handleSelectGroup}
                loading={loading}
              />
            </div>

            {mode && (
              <aside className={`commonSection ${styles.groupFormPanel}`}>
                <GroupForm
                  mode={mode}
                  group={selectedGroup}
                  onSuccess={handleFormSuccess}
                  onCancel={handleCancel}
                />
              </aside>
            )}
          </div>
        </section>
      </div>

      <AppAlert
        open={assignConfirmOpen}
        type="warning"
        title="주간 그룹을 재배치할까요?"
        message="전체 회원의 이번 주 공부시간을 기준으로 그룹이 즉시 재배치되고, 재배치 알림 모달이 각 회원에게 노출됩니다."
        showCancel={true}
        confirmText="재배치"
        onCancel={() => setAssignConfirmOpen(false)}
        onClose={() => setAssignConfirmOpen(false)}
        onConfirm={handleConfirmAssign}
      />

      <AppAlert
        open={Boolean(assignResultAlert)}
        type={assignResultAlert?.type}
        title={assignResultAlert?.title}
        message={assignResultAlert?.message}
        onClose={() => setAssignResultAlert(null)}
        onConfirm={() => setAssignResultAlert(null)}
      />
    </main>
  );
}