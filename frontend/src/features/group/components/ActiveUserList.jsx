import { getProfileImageUrl } from "../../../util/profileImage.js";
import { useEffect, useState } from "react";
import { socket } from "../../../../util/socket";

import { FiClock, FiUsers } from "react-icons/fi";

import styles from "./ActiveUserList.module.css";

const StudyTimer = ({ startTime }) => {
  const [timeText, setTimeText] = useState("00:00:00");

  useEffect(() => {
    const numericStartTime = Number(startTime);

    if (!numericStartTime || Number.isNaN(numericStartTime)) {
      setTimeText("00:00:00");
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(Date.now() - numericStartTime, 0);

      const hours = Math.floor(diff / 3600000);

      const minutes = Math.floor((diff % 3600000) / 60000);

      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeText(
        `${String(hours).padStart(2, "0")}:` +
          `${String(minutes).padStart(2, "0")}:` +
          `${String(seconds).padStart(2, "0")}`,
      );
    };

    // 처음 화면에 나타날 때 바로 시간 계산
    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [startTime]);

  return (
    <span className={styles.studyTimer}>
      <FiClock aria-hidden="true" />

      {timeText}
    </span>
  );
};

const parseActiveUser = (data) => {
  if (typeof data !== "string") {
    return data ?? {};
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("공부 중 사용자 데이터 변환 실패:", error);

    return {};
  }
};

export default function ActiveUsersList({ groupId, userId }) {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!groupId || !userId) {
      setActiveUsers([]);
      return;
    }

    const groupKey = String(groupId);

    const userKey = String(userId);

    /*
     * 최초 연결 또는 재연결이 완료되면
     * 다시 그룹 방에 입장합니다.
     */
    const joinCurrentGroup = () => {
      socket.emit("joinGroup", {
        groupId: groupKey,
        userId: userKey,
      });
    };

    /*
     * Redis에 저장된 현재 공부 중 사용자 목록
     */
    const handleCurrentActiveUsers = (usersMap = {}) => {
      const usersArray = Object.entries(usersMap).map(([id, data]) => ({
        userId: String(id),
        ...parseActiveUser(data),
      }));

      setActiveUsers(usersArray);
    };

    /*
     * 새로운 사용자가 공부를 시작한 경우
     */
    const handleUserStartedStudy = (newUser) => {
      const normalizedUser = {
        ...newUser,
        userId: String(newUser.userId),
      };

      setActiveUsers((prevUsers) => {
        const isAlreadyActive = prevUsers.some(
          (user) => String(user.userId) === normalizedUser.userId,
        );

        if (!isAlreadyActive) {
          return [...prevUsers, normalizedUser];
        }

        /*
         * 같은 사용자의 이벤트가 다시 들어오면
         * 중복 추가하지 않고 기존 데이터를 수정합니다.
         */
        return prevUsers.map((user) =>
          String(user.userId) === normalizedUser.userId
            ? {
                ...user,
                ...normalizedUser,
              }
            : user,
        );
      });
    };

    /*
     * 사용자가 Stop 버튼을 누른 경우
     */
    const handleUserStoppedStudy = ({ userId: stoppedUserId }) => {
      setActiveUsers((prevUsers) =>
        prevUsers.filter(
          (user) => String(user.userId) !== String(stoppedUserId),
        ),
      );
    };

    /*
     * 이벤트를 먼저 등록합니다.
     */
    socket.on("connect", joinCurrentGroup);

    socket.on("currentActiveUsers", handleCurrentActiveUsers);

    socket.on("userStartedStudy", handleUserStartedStudy);

    socket.on("userStoppedStudy", handleUserStoppedStudy);

    /*
     * 이미 연결됐다면 바로 그룹 입장,
     * 연결되지 않았다면 소켓 연결을 시작합니다.
     */
    if (socket.connected) {
      joinCurrentGroup();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", joinCurrentGroup);

      socket.off("currentActiveUsers", handleCurrentActiveUsers);

      socket.off("userStartedStudy", handleUserStartedStudy);

      socket.off("userStoppedStudy", handleUserStoppedStudy);

      /*
       * 기존 코드의 socket.disconnect()는 제거합니다.
       *
       * socket은 여러 컴포넌트가 공유하는 공용 객체이므로
       * 연결 자체를 끊지 않고 현재 그룹 방에서만 나갑니다.
       */
      if (socket.connected) {
        socket.emit("leaveGroup", {
          groupId: groupKey,
          userId: userKey,
        });
      }
    };
  }, [groupId, userId]);

  return (
    <section className={`commonSection ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <FiUsers aria-hidden="true" />

          <h2 className={styles.title}>접속자</h2>
        </div>

        <span className={styles.userCount}>{activeUsers.length}명 공부 중</span>
      </header>

      {activeUsers.length === 0 ? (
        <div className={styles.emptyState}>현재 공부 중인 멤버가 없습니다.</div>
      ) : (
        <ul className={styles.userList}>
          {activeUsers.map((user) => {

            // 강조 스타일
            const isCurrentUser = String(user.userId) === String(userId)

            return (
            <li
              key={user.userId}
              className={`${styles.userItem} ${isCurrentUser ? styles.currentUser : ""}`}
            >
              <img
                className={styles.profileImage}
                src={getProfileImageUrl(user.profileImg)}
                alt={`${user.userName} 프로필`}
                onError={(event) => {
                  event.currentTarget.src = "/images/noprofile.png";
                }}
              />

              <span className={styles.userName}>{user.userName}</span>

              <StudyTimer startTime={user.startTime} />
            </li>
            )
          })}
        </ul>
      )}
    </section>
  );
}
