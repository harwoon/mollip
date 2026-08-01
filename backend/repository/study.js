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


// 사용자의 이번 주 공부시간과 출석일 조회
// 주간 공부시간: 이번 주 sumStudyTime 전체 합계
// 출석일: 해당 날짜의 공부시간 합계가 60초 이상인 날짜
export async function findWeeklyStudySummaryByUser(
    userId,
    weekStartDate,
    weekEndDate
) {
    const result = await Study.aggregate([
        /*
         * 1. 로그인 사용자의 이번 주 공부 기록 조회
         */
        {
            $match: {
                user: new mongoose.Types.ObjectId(
                    String(userId)
                ),

                studyDate: {
                    $gte: weekStartDate,
                    $lte: weekEndDate
                },

                // 0초 이하의 잘못된 기록 제외
                sumStudyTime: {
                    $gt: 0
                }
            }
        },

        /*
         * 2. 같은 날짜의 공부시간 합산
         *
         * 한 날짜에 공부 기록이 여러 개 있더라도
         * 하나의 날짜로 묶어줍니다.
         */
        {
            $group: {
                _id: "$studyDate",

                dailyStudySeconds: {
                    $sum: "$sumStudyTime"
                }
            }
        },

        /*
         * 날짜를 오름차순으로 정렬
         */
        {
            $sort: {
                _id: 1
            }
        },

        /*
         * 3. 주간 총공부시간과 일별 공부시간 목록 생성
         */
        {
            $group: {
                _id: null,

                weeklyStudySeconds: {
                    $sum: "$dailyStudySeconds"
                },

                dailyStudies: {
                    $push: {
                        studyDate: "$_id",
                        dailyStudySeconds:
                            "$dailyStudySeconds"
                    }
                }
            }
        },

        /*
         * 4. 하루 공부시간이 60초 이상인 날짜만 출석 처리
         */
        {
            $project: {
                _id: 0,

                weeklyStudySeconds: 1,

                attendanceDates: {
                    $map: {
                        input: {
                            $filter: {
                                input: "$dailyStudies",
                                as: "dailyStudy",

                                cond: {
                                    $gte: [
                                        "$$dailyStudy.dailyStudySeconds",
                                        60
                                    ]
                                }
                            }
                        },

                        as: "attendance",

                        in: "$$attendance.studyDate"
                    }
                }
            }
        },

        /*
         * 5. 출석 날짜 개수 계산
         */
        {
            $addFields: {
                attendanceDays: {
                    $size: "$attendanceDates"
                }
            }
        }
    ])

    /*
     * 이번 주 공부 기록이 없으면 기본값 반환
     */
    return (
        result[0] || {
            weeklyStudySeconds: 0,
            attendanceDays: 0,
            attendanceDates: []
        }
    )
}


// 탈퇴 전 사용자 전체 공부시간 합산(누적)
export async function getTotalStudyTimeByUserId(userId) {
    const result = await Study.aggregate([
        {
            $match: {
                // 문자열 또는 ObjectId 모두 안전하게 변환
                user: new mongoose.Types.ObjectId(String(userId))
            }
        },
        {
            $group: {
                _id: null,

                // 모든 Study의 sumStudyTime 합산
                totalStudyTime: { $sum: "$sumStudyTime" }
            }
        }
    ])

    // 공부 기록이 없는 사용자는 0 반환
    return result[0]?.totalStudyTime || 0
}


// 관리자 서비스 전체 학습시간 추이 조회
export async function getServiceStudyTimeTrend(type, startDate, endDate,) {
    let groupId

    if (type === "daily") { groupId = "$studyDate" }

    if (type === "weekly") {
        groupId = {
            $dateToString: {
                format: "%Y-%m-%d",
                date: {
                    $dateTrunc: {
                        date: {
                            $dateFromString: {
                                dateString: "$studyDate",
                                format: "%Y-%m-%d"
                            }
                        },
                        unit: "week",
                        startOfWeek: "monday",
                        timezone: "Asia/Seoul",
                    }
                },
                timezone: "Asia/Seoul"
            }
        }
    }

    if (type === "monthly") {
        groupId = { $substrBytes: ["$studyDate", 0, 7] }
    }

    return Study.aggregate([
        {
            $match: {
                studyDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: groupId,
                totalMinutes: {
                    $sum: "$sumStudyTime"
                }
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                totalMinutes: 1
            }
        },
        {
            $sort: { date: 1 }
        }
    ])
}

// 현재 기간과 이전 기간의 총 공부시간을 계산할 때 공통으로 사용
export async function getServiceStudyTimeTotal(startDate, endDate,) {
    const result = await Study.aggregate([
        {
            // 조회 기간에 포함되는 모든 공부 기록 검색
            $match: {
                studyDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            // 날짜나 사용자 구분 없이 전체 공부시간을 하나로 합산
            $group: {
                _id: null,
                totalMinutes: { $sum: "$sumStudyTime" }
            }
        }
    ])
    // 공부 기록 없으면 0 반환
    return result[0]?.totalMinutes || 0
}

/**
 * 여러 사용자의 주간 공부시간과 출석일을 한 번에 조회
 *
 * 주간 공부시간:
 * 이번 주 sumStudyTime 전체 합계
 *
 * 출석일:
 * 같은 날짜의 공부시간을 합산한 뒤
 * 하루 총공부시간이 60초 이상인 날짜
 */
export async function findWeeklyStudySummariesByUsers(
    userIds,
    weekStartDate,
    weekEndDate
) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return []
    }

    /*
     * 문자열과 ObjectId가 섞여 있어도 안전하게 처리
     * 중복 사용자 ID도 제거
     */
    const validUserIds = [
        ...new Set(
            userIds.map((userId) => String(userId))
        )
    ]
        .filter((userId) =>
            mongoose.isValidObjectId(userId)
        )
        .map((userId) =>
            new mongoose.Types.ObjectId(userId)
        )

    if (validUserIds.length === 0) {
        return []
    }

    return Study.aggregate([
        /*
         * 1. 대상 사용자들의 이번 주 공부 기록 조회
         */
        {
            $match: {
                user: {
                    $in: validUserIds
                },

                studyDate: {
                    $gte: weekStartDate,
                    $lte: weekEndDate
                },

                sumStudyTime: {
                    $gt: 0
                }
            }
        },

        /*
         * 2. 사용자와 날짜별로 공부시간 합산
         *
         * 같은 회원이 같은 날짜에 여러 번 공부했으면
         * 해당 날짜 공부시간을 하나로 합침
         */
        {
            $group: {
                _id: {
                    user: "$user",
                    studyDate: "$studyDate"
                },

                dailyStudySeconds: {
                    $sum: "$sumStudyTime"
                }
            }
        },

        /*
         * 출석 날짜가 날짜순으로 들어가도록 정렬
         */
        {
            $sort: {
                "_id.user": 1,
                "_id.studyDate": 1
            }
        },

        /*
         * 3. 사용자별 주간 공부시간 계산
         */
        {
            $group: {
                _id: "$_id.user",

                weeklyStudySeconds: {
                    $sum: "$dailyStudySeconds"
                },

                dailyStudies: {
                    $push: {
                        studyDate: "$_id.studyDate",
                        dailyStudySeconds:
                            "$dailyStudySeconds"
                    }
                }
            }
        },

        /*
         * 4. 하루 60초 이상 공부한 날짜만 출석 처리
         */
        {
            $project: {
                _id: 0,

                userId: "$_id",

                weeklyStudySeconds: 1,

                attendanceDates: {
                    $map: {
                        input: {
                            $filter: {
                                input: "$dailyStudies",
                                as: "dailyStudy",

                                cond: {
                                    $gte: [
                                        "$$dailyStudy.dailyStudySeconds",
                                        60
                                    ]
                                }
                            }
                        },

                        as: "attendance",

                        in: "$$attendance.studyDate"
                    }
                }
            }
        },

        /*
         * 5. 출석일 개수 계산
         */
        {
            $addFields: {
                attendanceDays: {
                    $size: "$attendanceDates"
                }
            }
        }
    ])
}