// 사용자 과목별 비율 계산
export function calculateStudyStatistics(studies) {
    const subjectMap = new Map()

    for (const study of studies) {
        const studyTitle = study.studyTitle?.trim() || "기타"
        const studyTime = Number(study.sumStudyTime) || 0

        subjectMap.set(
            studyTitle,
            (subjectMap.get(studyTitle) || 0) + studyTime
        )
    }

    const totalStudyTime = [...subjectMap.values()]
        .reduce((total, studyTime) => total + studyTime, 0)

    const subjects = [...subjectMap.entries()]
        .map(([studyTitle, sumStudyTime]) => ({
            studyTitle,
            sumStudyTime,
            ratio:
                totalStudyTime === 0
                    ? 0
                    : Number(
                        (
                            (sumStudyTime / totalStudyTime) * 100
                        ).toFixed(2)
                    ),
        }))
        .sort((a, b) => b.sumStudyTime - a.sumStudyTime)

    return {
        totalStudyTime,
        subjects,
    }
}