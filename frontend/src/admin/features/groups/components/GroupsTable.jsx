import "./GroupsTable.css";

function formatNumber(
  value,
  maximumFractionDigits = 2,
) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits,
  }).format(Number(value) || 0);
}

export default function GroupsTable({
  groups = [],
  selectedGroupId,
  onSelectGroup,
  loading,
}) {
  console.log(
    "GroupsTable이 받은 groups:",
    groups,
  );

  if (loading) {
    return (
      <div className="groupsTableMessage">
        그룹 통계를 불러오는 중입니다.
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="groupsTableMessage">
        등록된 그룹이 없습니다.
      </div>
    );
  }

  return (
    <div className="groupsTableWrapper">
      <table className="groupsTable">
        <thead>
          <tr>
            <th>그룹명</th>

            <th>
              그룹 조건 시간(h)
            </th>

            <th>인원</th>

            <th>
              평균 목표 달성률
            </th>

            <th>
              평균 공부 시간(h)
            </th>

            <th>
              평균 접속 학습일
            </th>
          </tr>
        </thead>

        <tbody>
          {groups.map((group) => {
            /*
             * 그룹 인원
             */
            const memberCount =
              Number(group.memberCount) || 0;

            /*
             * 그룹 평균 목표 달성률
             */
            const averageGoalAchievementRate =
              Number(
                group.averageGoalAchievementRate,
              ) || 0;

            /*
             * 그룹 평균 공부시간
             */
            const averageStudyHours =
              Number(
                group.averageStudyHours,
              ) || 0;

            /*
             * 그룹 평균 출석일
             */
            const averageAttendanceDays =
              Number(
                group.averageAttendanceDays,
              ) || 0;

            /*
             * 그룹 조건 시간
             *
             * groupConditionHours가 있으면 사용하고
             * 없으면 groupTime을 초에서 시간으로 변환
             */
            const groupConditionHours =
              Number(
                group.groupConditionHours ??
                (Number(
                  group.groupTime,
                ) || 0) /
                3600,
              );

            /*
             * 진행 바는 0~100 범위로 제한
             */
            const progressRate = Math.min(
              Math.max(
                averageGoalAchievementRate,
                0,
              ),
              100,
            );

            const isSelected =
              String(selectedGroupId) ===
              String(group._id);

            return (
              <tr
                key={group._id}
                className={
                  isSelected
                    ? "groupsTableRow selected"
                    : "groupsTableRow"
                }
                onClick={() =>
                  onSelectGroup(group)
                }
              >
                {/* 그룹명 */}
                <td>
                  <div className="groupNameCell">
                    <span
                      className="groupColorDot"
                      style={{
                        backgroundColor:
                          group.groupColor ||
                          "#cccccc",
                      }}
                    />

                    <strong>
                      {group.groupName}
                    </strong>
                  </div>
                </td>

                {/* 그룹 조건 시간 */}
                <td>
                  {formatNumber(
                    groupConditionHours,
                  )}
                  시간
                </td>

                {/* 그룹 인원 */}
                <td>
                  {formatNumber(
                    memberCount,
                    0,
                  )}
                  명
                </td>

                {/* 평균 목표 달성률 */}
                <td>
                  <div className="goalRateCell">
                    <span className="goalRateText">
                      {formatNumber(
                        averageGoalAchievementRate,
                      )}
                      %
                    </span>

                    <div className="goalRateTrack">
                      <div
                        className="goalRateBar"
                        style={{
                          width: `${progressRate}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* 평균 공부시간 */}
                <td>
                  {formatNumber(
                    averageStudyHours,
                  )}
                  시간
                </td>

                {/* 평균 접속 학습일 */}
                <td>
                  {formatNumber(
                    averageAttendanceDays,
                  )}
                  일
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}