import React, { useState, useEffect } from "react";
import { socket } from "../../../util/socket.js";
import Topbar from "../components/AdminTopbar.jsx";
import SummaryRow from "../features/home/components/SummaryRow.jsx";
import { getGroupCount } from "../features/home/api/group.js";
import {
  getUserCount,
  getWeeklyTodoAchievement,
  getLog,
} from "../features/home/api/user.js";
import { getGroup } from "../features/groups/api/group.js";
import { getTotalTime } from "../features/home/api/study.js";
import { getGroupStudyTime } from "../features/groups/api/group.js";
import GroupStudyTimeChart from "../features/home/components/GroupStudyTimeChart.jsx";

import ActiveUser from "../features/home/components/ActiveUser.jsx";
import RecentUser from "../features/home/components/RecentUser.jsx";
import StudyTrend from "../features/home/components/StudyTrend.jsx";
import GroupGoalAchievement from "../features/groups/components/GroupGoalAchievement.jsx";
import { fetchAdminGroupStatistics } from "../features/groups/api/adminGroupStatisticsApi.js";

import styles from "./AdminHomePage.module.css"
import layoutStyles from "../components/AdminLayout.module.css" 


export default function AdminHomePage() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  const [summary, setSummary] = useState({
    groupCount: 0,
    groupCountDiff: 0,

    totalUserCount: 0,
    userCountDiff: 0,

    studyingCount: 0,
    // studyingCountNote: "수정 필요",

    weeklyTotalTime: 0,
    weeklyTotalTimeDiff: "",

    avgGoalRate: 0,
    avgGoalRateDiff: 0,
  });

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState("");

  const [groupStudySummary, setGroupStudySummary] = useState({
    startDate: "",
    endDate: "",
    allGroupsTotalStudyTime: 0,
    groupStatistics: [],
  });

  const [groupStudyLoading, setGroupStudyLoading] = useState(true);
  const [groupStudyError, setGroupStudyError] = useState("");
  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await getLog();
        setLogs(data);
      } catch (error) {
        console.error("로그 데이터 불러오기 실패:", error);
      }
    }
    fetchLogs();

    let isMounted = true;

    /*
     * 사용자에게 그룹 이름과 그룹 색상 추가
     */
    const addGroupInfo = async (user) => {
      try {
        const groupData = await getGroup(user.groupId);

        return {
          ...user,
          userId: String(user.userId),
          groupId: String(user.groupId),

          groupName: groupData.group?.groupName || "알 수 없는 그룹",

          groupColor: groupData.group?.groupColor || "#999999",
        };
      } catch (error) {
        console.error("그룹 정보 조회 실패:", user.groupId, error);

        return {
          ...user,
          userId: String(user.userId),
          groupId: String(user.groupId),
          groupName: "알 수 없는 그룹",
          groupColor: "#999999",
        };
      }
    };

    /*
     * 소켓 최초 연결 및 재연결 시
     * 관리자 방에 다시 입장
     */
    const handleJoinAdminRoom = () => {
      console.log("관리자 소켓 연결:", socket.id);

      socket.emit("joinAdminRoom");
    };

    /*
     * 관리자 새로고침 또는 다른 메뉴에서 돌아왔을 때
     * Redis에 저장된 현재 공부 중 사용자 전체
     */
    const handleCurrentAdminActiveUsers = async (users = []) => {
      try {
        const safeUsers = Array.isArray(users) ? users : [];

        const usersWithGroup = await Promise.all(
          safeUsers.map((user) => addGroupInfo(user)),
        );

        if (!isMounted) {
          return;
        }

        setActiveUsers(usersWithGroup);
      } catch (error) {
        console.error("현재 공부 중 사용자 목록 처리 실패:", error);

        if (isMounted) {
          setActiveUsers([]);
        }
      }
    };

    /*
     * 새로운 관리자 로그
     */
    const handleNewAdminLog = (newLog) => {
      setLogs((prevLogs) => [newLog, ...prevLogs]);
    };

    /*
     * 사용자가 공부를 새로 시작
     */
    const handleAdminUserStarted = async (newUser) => {
      const userWithGroup = await addGroupInfo(newUser);

      if (!isMounted) {
        return;
      }

      setActiveUsers((prevUsers) => {
        const userId = String(userWithGroup.userId);

        const isAlreadyActive = prevUsers.some(
          (user) => String(user.userId) === userId,
        );

        /*
         * 이미 목록에 있으면 최신 정보로 변경
         */
        if (isAlreadyActive) {
          return prevUsers.map((user) =>
            String(user.userId) === userId
              ? {
                  ...user,
                  ...userWithGroup,
                }
              : user,
          );
        }

        return [...prevUsers, userWithGroup];
      });
    };

    /*
     * 사용자가 Stop 버튼을 누름
     */
    const handleAdminUserStopped = ({ userId: stoppedUserId }) => {
      setActiveUsers((prevUsers) =>
        prevUsers.filter(
          (user) => String(user.userId) !== String(stoppedUserId),
        ),
      );
    };

    /*
     * 소켓 이벤트 등록
     */
    socket.on("connect", handleJoinAdminRoom);

    socket.on("currentAdminActiveUsers", handleCurrentAdminActiveUsers);

    socket.on("newAdminLog", handleNewAdminLog);

    socket.on("adminUserStarted", handleAdminUserStarted);

    socket.on("adminUserStopped", handleAdminUserStopped);

    /*
     * 이미 연결돼 있으면 바로 입장
     * 연결되지 않았으면 connect 실행
     */
    if (socket.connected) {
      handleJoinAdminRoom();
    } else {
      socket.connect();
    }

    async function fetchSummary() {
      try {
        const [groupData, userData, todoAchievementData, totalTimeData] =
          await Promise.all([
            getGroupCount(),
            getUserCount(),
            getWeeklyTodoAchievement(),
            getTotalTime(),
          ]);

        setSummary((prev) => ({
          ...prev,
          // 운영 중인 그룹 수
          groupCount: Number(groupData.count) || 0,

          // 그룹 수 전주 대비 증감
          groupCountDiff: Number(groupData.groupCountDiff) || 0,

          // 전체 사용자 수
          totalUserCount: Number(userData.totalUserCount) || 0,

          // 사용자 수 전주 대비 증감
          userCountDiff: Number(userData.userCountDiff) || 0,

          // 탈퇴 회원 수
          withdrawnUserCount: Number(userData.withdrawnUserCount) || 0,

          // 휴면 회원을 제외한 정상 회원 수
          normalUserCount: Number(userData.normalUserCount) || 0,

          // 휴면 그룹 소속 회원 수
          dormantUserCount: Number(userData.dormantUserCount) || 0,

          // 이번 주 총 공부시간
          weeklyTotalTime: totalTimeData.currentWeeklyStudyTime,

          // 이번주 와 저번주 공부시간 차이
          weeklyTotalTimeDiff: totalTimeData.weeklyStudyTimeDiff,

          // 이번 주 전체 Todo 달성률
          avgGoalRate:
            Number(todoAchievementData.achievement?.achievementRate) || 0,

          // 지난주 대비 Todo 달성률 차이
          avgGoalRateDiff:
            Number(todoAchievementData.achievement?.achievementRateDiff) || 0,
        }));
      } catch (error) {
        console.error("데이터 조회 실패", error.message);
      }
    }

    async function fetchGroupStatistics() {
      try {
        setGroupsLoading(true);
        setGroupsError("");

        const data = await fetchAdminGroupStatistics();
        const groupList = Array.isArray(data.groups) ? data.groups : [];
        setGroups(groupList);
      } catch (error) {
        console.error("그룹 목표 달성률 조회 실패:", error);

        setGroups([]);

        setGroupsError(
          error.message || "그룹 목표 달성률을 불러오지 못했습니다.",
        );
      } finally {
        setGroupsLoading(false);
      }
    }
    async function fetchGroupStudySummary() {
      try {
        setGroupStudyLoading(true);
        setGroupStudyError("");

        const data = await getGroupStudyTime();

        setGroupStudySummary({
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          allGroupsTotalStudyTime: Number(data.allGroupsTotalStudyTime) || 0,
          groupStatistics: Array.isArray(data.groupStatistics)
            ? data.groupStatistics
            : [],
        });
      } catch (error) {
        console.error("그룹별 공부시간 조회 실패:", error);

        setGroupStudyError(
          error.message || "그룹별 공부시간을 불러오지 못했습니다.",
        );
      } finally {
        setGroupStudyLoading(false);
      }
    }

    fetchSummary();
    fetchGroupStatistics();
    fetchGroupStudySummary();

    return () => {
      isMounted = false;

      socket.off("connect", handleJoinAdminRoom);

      socket.off("currentAdminActiveUsers", handleCurrentAdminActiveUsers);

      socket.off("newAdminLog", handleNewAdminLog);

      socket.off("adminUserStarted", handleAdminUserStarted);

      socket.off("adminUserStopped", handleAdminUserStopped);

      /*
       * 공용 socket 연결 자체는 끊지 않고
       * 관리자 방에서만 나감
       */
      if (socket.connected) {
        socket.emit("leaveAdminRoom");
      }

      // 삭제해야 함
      // socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setSummary((prev) => ({
      ...prev,
      studyingCount: activeUsers.length,
    }));
  }, [activeUsers.length]);

  return (
    <main className={`app-page ${layoutStyles.adminPage} ${styles.adminDashboardPage}`}>
      <div className={`app-page__inner ${layoutStyles.adminPageInner} ${styles.adminDashboardInner}`}>
        <Topbar
          title="관리자 대시보드"
          description="Mollip 서비스 전체 운영 현황을 한눈에 확인하고 필요한 항목을 관리하세요."
        />

        <SummaryRow summary={summary} />

        <section className={`${styles.adminDashboardGrid} ${styles.adminDashboardGridTop}`}>
          <GroupStudyTimeChart
            summary={groupStudySummary}
            loading={groupStudyLoading}
            error={groupStudyError}
          />

          <ActiveUser activeUsers={activeUsers} />
        </section>

        <section className={`${styles.adminDashboardGrid} ${styles.adminDashboardGridBottom}`}>
          <div className={styles.groupsAchievementPanel}>
            {groupsError && (
              <p className={styles.groupsAchievementError}>{groupsError}</p>
            )}
            <GroupGoalAchievement groups={groups} loading={groupsLoading} />
          </div>

          <RecentUser logs={logs} />
        </section>

        <StudyTrend />
      </div>
    </main>
  );
}
