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