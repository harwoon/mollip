import { useEffect, useMemo, useState } from "react";

import Topbar from "../components/AdminTopbar.jsx";
import GroupsTable from "../features/groups/components/GroupsTable.jsx";
import GroupForm from "../features/groups/components/GroupForm.jsx";
import { getGroups } from "../features/groups/api/group.js";
import "./AdminGroupsPage.css";

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [mode, setMode] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [sortField, setSortField] = useState("groupTime");

  const [sortOrder, setSortOrder] = useState("desc");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /*
   * 그룹 목록 조회
   */
  async function fetchGroups() {
    try {
      setLoading(true);
      setError("");

      const data = await getGroups();

      setGroups(Array.isArray(data.groups) ? data.groups : []);
    } catch (error) {
      console.error("그룹 목록 조회 실패:", error);

      setError(error.message || "그룹 목록 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  /*
   * 정렬된 그룹 목록
   */
  const sortedGroups = useMemo(() => {
    const copiedGroups = [...groups];

    copiedGroups.sort((first, second) => {
      let result = 0;

      if (sortField === "groupName") {
        result = String(first.groupName || "").localeCompare(
          String(second.groupName || ""),
          "ko",
        );
      } else {
        result = Number(first[sortField] ?? 0) - Number(second[sortField] ?? 0);
      }

      return sortOrder === "asc" ? result : -result;
    });

    return copiedGroups;
  }, [groups, sortField, sortOrder]);

  /*
   * 그룹 행 클릭
   */
  function handleSelectGroup(group) {
    setSelectedGroup(group);
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
   * 생성 또는 수정 성공
   */
  async function handleFormSuccess() {
    setMode(null);
    setSelectedGroup(null);

    await fetchGroups();
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
        description="생성된 모든 그룹을 관리하고 조회할 수 있습니다."
      />

      <section className="groupsPageSection">
        <div className="groupsToolbar">
          <div>
            <h2>그룹 관리하기</h2>

            <p>생성된 모든 그룹을 관리하고 조회할 수 있습니다.</p>
          </div>

          <div className="groupsToolbarActions">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="groupTime">그룹 조건 시간</option>

              <option value="groupName">그룹명</option>

              <option value="memberCount">인원</option>

              <option value="averageGoalRate">평균 목표 달성률</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">내림차순</option>

              <option value="asc">오름차순</option>
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

        {error && <p className="groupsPageError">{error}</p>}

        <div
          className={
            mode ? "groupsPageContent formOpened" : "groupsPageContent"
          }
        >
          <div className="groupsTablePanel">
            <GroupsTable
              groups={sortedGroups}
              selectedGroupId={selectedGroup?._id}
              onSelectGroup={handleSelectGroup}
              loading={loading}
            />
          </div>

          {mode && (
            <aside className="groupFormPanel">
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
  );
}
