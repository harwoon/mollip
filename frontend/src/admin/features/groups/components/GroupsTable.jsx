import "./GroupsTable.css";

export default function GroupsTable({
  groups,
  selectedGroupId,
  onSelectGroup,
  loading,
}) {
  if (loading) {
    return (
      <div className="groupsTableMessage">그룹 목록을 불러오는 중입니다.</div>
    );
  }

  if (!groups.length) {
    return <div className="groupsTableMessage">등록된 그룹이 없습니다.</div>;
  }

  return (
    <div className="groupsTableWrapper">
      <table className="groupsTable">
        <thead>
          <tr>
            <th>그룹명</th>
            <th>그룹 조건 시간(h)</th>
            <th>인원</th>
            <th>평균 목표 달성률</th>
            <th>평균 공부 시간(h)</th>
            <th>평균 접속 학습일</th>
          </tr>
        </thead>

        <tbody>
          {groups.map((group) => {
            /*
             * 통계 데이터가 아직 없으면
             * 새 그룹은 0으로 표시
             */
            const memberCount = group.memberCount ?? group.members?.length ?? 0;

            const averageGoalRate = Number(group.averageGoalRate ?? 0);

            const averageStudyTime = Number(group.averageStudyTime ?? 0);

            const averageAttendanceDays = Number(
              group.averageAttendanceDays ?? 0,
            );

            const progressRate = Math.min(Math.max(averageGoalRate, 0), 100);

            const isSelected = selectedGroupId === group._id;

            return (
              <tr
                key={group._id}
                className={
                  isSelected ? "groupsTableRow selected" : "groupsTableRow"
                }
                onClick={() => onSelectGroup(group)}
              >
                <td>
                  <div className="groupNameCell">
                    <span
                      className="groupColorDot"
                      style={{
                        backgroundColor: group.groupColor,
                      }}
                    />

                    <strong>{group.groupName}</strong>
                  </div>
                </td>

                <td>{group.groupTime / 3600 }시간</td>

                <td>{memberCount}명</td>

                <td>
                  <div className="goalRateCell">
                    <span className="goalRateText">{averageGoalRate}%</span>

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

                <td>{averageStudyTime}시간</td>

                <td>{averageAttendanceDays}일</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
