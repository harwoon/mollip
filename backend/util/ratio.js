import { findColorByUserAndTitle } from "../repository/subject.js";
// 사용자 과목별 비율 계산
export async function calculateStudyStatistics(studies) {
  const subjectMap = new Map();
  const userId = studies[0].user.toString();

  for (const study of studies) {
    const studyTitle = study.studyTitle?.trim() || "기타";
    const studyTime = Number(study.sumStudyTime) || 0;

    subjectMap.set(studyTitle, (subjectMap.get(studyTitle) || 0) + studyTime);
  }

  const totalStudyTime = [...subjectMap.values()].reduce(
    (total, studyTime) => total + studyTime,
    0,
  );

  const subjects = [...subjectMap.entries()]
    .map(([studyTitle, sumStudyTime]) => ({
      studyTitle,
      sumStudyTime,
      ratio:
        totalStudyTime === 0
          ? 0
          : Number(((sumStudyTime / totalStudyTime) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.sumStudyTime - a.sumStudyTime);

  
  for (const subject of subjects) {
    let color = "";
    color = await findColorByUserAndTitle(userId, subject.studyTitle);
    subject.subjectColor = color;
  }
  console.log("============subjects=============");
  console.log(subjects);
  

  return {
    totalStudyTime,
    subjects,
  };
}
