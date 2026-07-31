import { findColorByUserAndTitle } from "../repository/subject.js"

const DEFAULT_COLORS = [
  "#8058C7",
  "#A38EC9",
  "#C0F1DC",
  "#F2B8B5",
  "#F4D58D",
  "#83B5D1",
]

// 사용자 과목별 공부 시간 및 비율 계산
export async function calculateStudyStatistics(
  studies = [],
  userId,
) {
  // 공부 기록이 없으면 정상적으로 빈 결과 반환
  if (!Array.isArray(studies) || studies.length === 0) {
    return {
      totalStudyTime: 0,
      subjects: [],
    }
  }

  if (!userId) {
    throw new Error("사용자 정보가 없습니다.")
  }

  const subjectMap = new Map()

  for (const study of studies) {
    const studyTitle =
      study.studyTitle?.trim() || "기타"

    const studyTime =
      Number(study.sumStudyTime) || 0

    subjectMap.set(
      studyTitle,
      (subjectMap.get(studyTitle) || 0) +
        studyTime,
    )
  }

  const totalStudyTime = [
    ...subjectMap.values(),
  ].reduce(
    (total, studyTime) =>
      total + studyTime,
    0,
  )

  const sortedSubjects = [
    ...subjectMap.entries(),
  ].sort(
    ([, timeA], [, timeB]) =>
      timeB - timeA,
  )

  const subjects = await Promise.all(
    sortedSubjects.map(
      async (
        [studyTitle, sumStudyTime],
        index,
      ) => {
        const colorResult =
          await findColorByUserAndTitle(
            userId,
            studyTitle,
          )

        /*
          Repository 반환 형태가 달라도 처리:
          1. "#8058C7"
          2. { subjectColor: "#8058C7" }
          3. [{ subjectColor: "#8058C7" }]
        */
        const dbColor =
          typeof colorResult === "string"
            ? colorResult
            : colorResult?.subjectColor ||
              colorResult?.[0]?.subjectColor ||
              ""

        const subjectColor =
          dbColor.trim() ||
          DEFAULT_COLORS[
            index % DEFAULT_COLORS.length
          ]

        const ratio =
          totalStudyTime === 0
            ? 0
            : Number(
                (
                  (sumStudyTime /
                    totalStudyTime) *
                  100
                ).toFixed(2),
              )

        return {
          studyTitle,
          sumStudyTime,
          ratio,
          subjectColor,
        }
      },
    ),
  )

  return {
    totalStudyTime,
    subjects,
  }
}
export function calculateWeeklyStudyTimeByGroup({
    groups = [],
    users = [],
    weeklyStudies = [],
}) {
    // 사용자 ID → 그룹 ID
    const userGroupMap = new Map()

    // 그룹 ID → 그룹 통계
    const groupStatisticsMap = new Map()

    // 1. 모든 그룹을 통계 Map에 등록
    for (const group of groups) {
        const groupId = String(group._id)

        groupStatisticsMap.set(groupId, {
            groupId,
            groupName: group.groupName,
            groupColor: group.groupColor,
            groupTime: group.groupTime,
            memberCount: 0,
            studyUserCount: 0,
            totalStudyTime: 0,
        })
    }

    // 2. 사용자 ID와 그룹 ID 연결
    for (const user of users) {
        // 그룹이 없는 사용자 제외
        if (!user.groupId) {
            continue
        }

        const userId = String(user._id)
        const groupId = String(user.groupId)

        // Unranked 사용자 제외
        if (groupId === "Unranked") {
            continue
        }

        // 실제 등록된 그룹이 아닌 경우 제외
        const groupStatistics =
            groupStatisticsMap.get(groupId)

        if (!groupStatistics) {
            continue
        }

        // 사용자 ID로 그룹을 찾을 수 있게 저장
        userGroupMap.set(userId, groupId)

        // 해당 그룹의 전체 회원 수 증가
        groupStatistics.memberCount += 1
    }

    // 3. 사용자별 공부시간을 소속 그룹에 합산
    for (const study of weeklyStudies) {
        const userId = String(study._id)

        // 사용자가 소속된 그룹 찾기
        const groupId = userGroupMap.get(userId)

        if (!groupId) {
            continue
        }

        // 해당 그룹의 통계 데이터 찾기
        const groupStatistics =
            groupStatisticsMap.get(groupId)

        if (!groupStatistics) {
            continue
        }

        const studyTime =
            Number(study.totalStudyTime) || 0

        // 그룹 총 공부시간 증가
        groupStatistics.totalStudyTime += studyTime

        // 실제 공부 기록이 있는 사용자 수
        if (studyTime > 0) {
            groupStatistics.studyUserCount += 1
        }
    }

    // 4. 배열로 변환하고 공부시간 내림차순 정렬
    return [...groupStatisticsMap.values()]
        .map((group) => ({
            ...group,

            // 전체 그룹원 기준 평균 공부시간
            averageStudyTime:
                group.memberCount > 0
                    ? Math.floor(
                          group.totalStudyTime /
                              group.memberCount,
                      )
                    : 0,
        }))
        .sort(
            (a, b) =>
                b.totalStudyTime -
                a.totalStudyTime,
        )
}