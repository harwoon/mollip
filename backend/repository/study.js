import Study from "../models/Study.js";
import mongoose from "mongoose";

export async function createStudy(studyData) {
  const study = new Study(studyData);
  const savedStudy = await study.save();
  return savedStudy.toObject();
}

// 일간 기록 가져오기
export async function getDailyByUserIdAndDate(
  user,
  date,
  sortOption = {},
  limitOption = 0,
) {
  return Study.find({
    user,
    studyDate: date,
  })
    .sort(sortOption)
    .limit(limitOption);
  // 원하는 속성만 리턴할 경우
  // return Study.find({user,studyDate:date}).select("studyTitle studyDate sumStudyTime -_id")
}

// 주간 기록 가져오기
export async function getWeeklyByUserIdAndDate(
  user,
  startDate,
  endDate,
  sortOption = {},
  limitOption = 0,
) {
  return Study.find({
    user,
    studyDate: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort(sortOption)
    .limit(limitOption);
}

// 월간 기록 가져오기
export async function getMonthlyByUserIdAndDate(
  user,
  month,
  sortOption = {},
  limitOption = 0,
) {
  return Study.find({
    user,
    studyDate: { $regex: `^${month}` },
  })
    .sort(sortOption)
    .limit(limitOption);
}

// 일간 과목 기록 가져오기
export async function getDailyByUserIdAndSubjectAndDate(user, subject, date) {
  return Study.find({
    user,
    studyTitle: subject,
    studyDate: date,
  });
}

// 주간 과목 기록 가져오기
export async function getWeeklyByUserIdAndSubjectAndDate(
  user,
  subject,
  startDate,
  endDate,
) {
  return Study.find({
    user,
    studyTitle: subject,
    studyDate: {
      $gte: startDate,
      $lte: endDate,
    },
  });
}

// 월간 과목 기록 가져오기
export async function getMonthlyByUserIdAndSubjectAndDate(
  user,
  subject,
  month,
) {
  return Study.find({
    user,
    subjectTitle: subject,
    studyDate: { $regex: `^${month}` },
  });
}

// 공부 기록 삭제
export async function deleteMany(userId) {
  return await Study.deleteMany({ user: userId });
}

// 유저 전체 누적 학습 기록 가져오기 (합산용) - 관리자
export async function getAllByUserId(user) {
  return Study.find({ user });
}

export async function getWeeklyStudyTimeByUSers(startDate, endDate) {
  return Study.aggregate([
    {
      $match: {
        studyDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: "$user",
        totalStudyTime: {
          $sum: "$sumStudyTime",
        },
      },
    },
  ]);
}


//사용자의 이번 주 공부시간과 출석일 조회
//주간 공부시간: 이번 주에 저장된 sumStudyTime의 합계
//출석일: sumStudyTime이 0보다 큰 서로 다른 studyDate의 개수
export async function findWeeklyStudySummaryByUser(
  userId,
  weekStartDate,
  weekEndDate,
) {
  const result = await Study.aggregate([
    // 로그인 사용자와 이번 주 공부 기록 조회
    {
      $match: {
        user: new mongoose.Types.ObjectId(String(userId)),

        studyDate: {
          $gte: weekStartDate,
          $lte: weekEndDate,
        },

        sumStudyTime: {
          $gt: 0,
        },
      },
    },

    // 총 공부시간과 공부한 날짜를 모음
    {
      $group: {
        _id: null,

        weeklyStudyMinutes: {
          $sum: "$sumStudyTime",
        },
        
        //같은 날짜의 기록이 여러 개 있어도 출석은 하루로 계산
        attendanceDates: {
          $addToSet: "$studyDate",
        },
      },
    },

    // 반환 데이터 정리
    {
      $project: {
        _id: 0,
        weeklyStudyMinutes: 1,
        attendanceDates: 1,

        attendanceDays: {
          $size: "$attendanceDates",
        },
      },
    },
  ]);

   // 이번 주 공부 기록이 없으면 기본값 반환
  return (
    result[0] || {
      weeklyStudyMinutes: 0,
      attendanceDays: 0,
      attendanceDates: [],
    }
  );
}
