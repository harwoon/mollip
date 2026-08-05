import mongoose from "mongoose";
import TodoList from "../models/Todo.js";

// 로그인한 사용자 TodoList 조회
export async function getTodoListByUserId(userId) {
    return TodoList.findOne({
        user: userId,
    });
}

// Todo 추가
export async function addTodo(userId, todoContent, todoDate) {
    // Todo 하나 구분하기 위한 고유 ID
    const newTodo = {
        // id: new mongoose.Types.ObjectId(),
        todo: todoContent,
        state: false,
    };

    // TodoList 있으면 todo를 배열에 추가, 없으면 TodoList 생성하여 추가
    return TodoList.findOneAndUpdate(
        {
            user: userId,
            todoDate,
        },
        {
            // 새로운 todo 추가
            $push: {
                todo: newTodo,
            },
        },
        {
            // 수정된 문서 반환
            new: true,
            upsert: true, // update insert
        },
    );
}

// Todo 완료 여부 수정
export async function updateTodoState(userId, todoId, state) {
    // 잘못된 ObjectId 전달된 경우
    if (!mongoose.isValidObjectId(todoId)) {
        return null;
    }

    return TodoList.findOneAndUpdate(
        {
            user: userId,
            "todo._id": todoId,
        },
        {
            $set: {
                "todo.$.state": state,
            },
        },
        {
            new: true,
        },
    );
}

// Todo 삭제
export async function deleteTodo(userId, todoId) {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(todoId)) {
        return null;
    }
    // TodoList안에 todo를 삭제하는건 배열을 수정하는 개념이라 Update임
    // Todo가 독립 컬션이면 Delete 가능
    return TodoList.findOneAndUpdate(
        {
            user: userId,
            "todo._id": todoId,
        },
        {
            $pull: {
                todo: { _id: todoId },
            },
        },
        {
            new: true,
        },
    );
}

// 일간 TodoList 조회
export async function getDailyByUserIdAndDate(userId, date) {
    return TodoList.findOne({
        user: userId,
        todoDate: date,
    });
}

// 주간 todoList 조회
export async function getWeeklyByUserIdAndDate(userId, startDate, endDate) {
    return TodoList.find({
        user: userId,
        todoDate: {
            $gte: startDate,
            $lte: endDate,
        },
    }).sort({
        todoDate: 1,
    });
}

// 월간 TodoList 조회
export async function getMonthlyByUserIdAndDate(userId, month) {
    return TodoList.find({
        user: userId,
        todoDate: {
            $regex: `^${month}`,
        },
    }).sort({
        todoDate: 1,
    });
}

// 일간 목표 달성률
export async function getDailyAchievement(userId, date) {
    const todoList = await TodoList.findOne({
        user: userId,
        todoDate: date,
    });

    // 해당 날짜 TodoList 없는 경우
    if (!todoList) {
        return {
            totalCount: 0, // 전체
            completedCount: 0, // 완료
            achievementRate: 0, // 목표달성률
        };
    }

    // 해당 날짜 전체 todo 개수
    const totalCount = todoList.todo.length;

    // todo의 state: ture
    const completedCount = todoList.todo.filter(
        (todoItem) => todoItem.state === true,
    ).length;

    // 목표달성률 계산
    // 전체 Todo 0일경우 0으로 나누면 오류발생 : 0 반환
    // Todo 존재하면 완료개수 / 전체개수 * 100
    // Math.round(): 소수점 첫째자리에서 반올림해 정수 반환
    const achievementRate =
        totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return {
        totalCount,
        completedCount,
        achievementRate,
    };
}

// 여러 사용자의 주간 Todo 목록 조회
export async function getWeeklyTodoListsByUsers(userIds, startDate, endDate) {
    return TodoList.find({
        user: { $in: userIds },
        todoDate: {
            $gte: startDate,
            $lte: endDate,
        },
    })
        .sort({ todoDate: 1 })
        .lean();
}

// 개인 투두리스트 삭제
export const deleteMany = async (userId) => {
    return await TodoList.deleteMany({ user: userId });
};

// 사용자의 주간 Todo 달성 현황 조회 - 성욱
// 전체 Todo 개수: 주간 todo 배열 안에 들어 있는 전체 항목 수
// 완료 Todo 개수: todo.state가 true인 항목 수
export async function findWeeklyTodoSummaryByUser(
    userId,
    weekStartDate,
    weekEndDate,
) {
    const result = await TodoList.aggregate([
        // 로그인 사용자와 이번 주 날짜에 해당하는 Todo 문서만 조회

        {
            $match: {
                user: new mongoose.Types.ObjectId(String(userId)),

                todoDate: {
                    $gte: weekStartDate,
                    $lte: weekEndDate,
                },
            },
        },

        // Todo 문서 안의 todo 배열을 각각 하나의 데이터로 분리
        { $unwind: "$todo", },
        // 전체 Todo와 완료 Todo 개수 계산
        {
            $group: {
                _id: null,

                totalTodoCount: {
                    $sum: 1,
                },

                completedTodoCount: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$todo.state", true],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },

        // Todo 달성률 계산
        {
            $project: {
                _id: 0,
                totalTodoCount: 1,
                completedTodoCount: 1,

                todoCompletionRate: {
                    $round: [
                        {
                            $multiply: [
                                {
                                    $divide: ["$completedTodoCount", "$totalTodoCount"],
                                },
                                100,
                            ],
                        },
                        2,
                    ],
                },
            },
        },
    ]);

    // 이번 주 Todo가 없으면 기본값 반환
    return (
        result[0] || {
            totalTodoCount: 0,
            completedTodoCount: 0,
            todoCompletionRate: 0,
        }
    );
}

// 전체 사용자의 주간 Todo 달성 현황 조회
export async function getWeeklyAchievementByUsers(
    startDate,
    endDate,
) {
    return TodoList.aggregate([
        // 이번 주 TodoList만 조회
        {
            $match: {
                todoDate: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },

        // TodoList 문서별 전체 Todo 및 완료 Todo 개수 계산
        {
            $project: {
                user: 1,

                totalCount: {
                    $size: {
                        $ifNull: ["$todo", []],
                    },
                },

                completedCount: {
                    $size: {
                        $filter: {
                            input: {
                                $ifNull: ["$todo", []],
                            },
                            as: "todoItem",
                            cond: {
                                $eq: ["$$todoItem.state", true],
                            },
                        },
                    },
                },
            },
        },

        // 사용자별 주간 Todo 개수 합산
        {
            $group: {
                _id: "$user",

                totalCount: {
                    $sum: "$totalCount",
                },

                completedCount: {
                    $sum: "$completedCount",
                },
            },
        },
    ]);
}

// 여러 사용자의 주간 Todo 달성 현황 일괄 조회 - 성욱
// 반환값: 전체 Todo 개수, 완료 Todo 개수, Todo 완료율
export async function findWeeklyTodoSummariesByUsers(
    userIds,
    weekStartDate,
    weekEndDate
) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return []
    }

    // 문자열과 ObjectId가 섞여 있어도 처리할 수 있도록 ObjectId로 통일하고 중복을 제거
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

    return TodoList.aggregate([
        // 1. 대상 사용자와 이번 주 TodoList 조회
        {
            $match: {
                user: {
                    $in: validUserIds
                },

                todoDate: {
                    $gte: weekStartDate,
                    $lte: weekEndDate
                }
            }
        },

        // 2. TodoList 문서마다 전체 Todo와 완료 Todo 개수 계산
        {
            $project: {
                user: 1,

                totalTodoCount: {
                    $size: {
                        $ifNull: ["$todo", []]
                    }
                },

                completedTodoCount: {
                    $size: {
                        $filter: {
                            input: {
                                $ifNull: ["$todo", []]
                            },

                            as: "todoItem",

                            cond: {
                                $eq: [
                                    "$$todoItem.state",
                                    true
                                ]
                            }
                        }
                    }
                }
            }
        },

        // 3. 한 사용자에게 여러 날짜의 TodoList가 있으면 주간 기준으로 모두 합산
        {
            $group: {
                _id: "$user",

                totalTodoCount: {
                    $sum: "$totalTodoCount"
                },

                completedTodoCount: {
                    $sum: "$completedTodoCount"
                }
            }
        },

        // 4. Todo 완료율 계산 Todo가 0개라면 완료율 0%
        {
            $project: {
                _id: 0,

                userId: "$_id",

                totalTodoCount: 1,
                completedTodoCount: 1,

                todoCompletionRate: {
                    $cond: [
                        {
                            $eq: [
                                "$totalTodoCount",
                                0
                            ]
                        },

                        0,

                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                "$completedTodoCount",
                                                "$totalTodoCount"
                                            ]
                                        },

                                        100
                                    ]
                                },

                                2
                            ]
                        }
                    ]
                }
            }
        }
    ])
}

// 관리자 회원 상세 Todo 달성률 추이 조회
export async function getUserTodoAchievementTrend(userId, type, startDate, endDate) {
    // 조회 유형에 따라 MongoDB 그룹화 기준을 설정
    let groupId
    if (type === "daily") {
        groupId = "$todoDate"
    } else if (type === "weekly") {
        groupId = {
            year: {
                $isoWeekYear: {
                    $dateFromString: {dateString: "$todoDate"}
                }
            },
            week: {
                $isoWeek: {
                    $dateFromString: {dateString: "$todoDate"}
                }
            }
        }
    } else if (type === "monthly") {
        groupId = {
            $substrBytes: ["$todoDate", 0, 7]
        }
    } else {
        throw new Error(
            "type은 daily, weekly, monthly 중 하나여야 합니다."
        )
    }

    return TodoList.aggregate([
        // 선택회원, 날짜 범위에 해당하는 TodoList 문서 조회
        {
            $match: {
                user: new mongoose.Types.ObjectId(String(userId)),
                todoDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },

        {$unwind: "$todo" },

        // 일간·주간·월간 기준으로 묶어서 전체 Todo 개수와 완료 Todo 개수 계산
        {
            $group: {
                _id: groupId,

                totalCount: {
                    $sum: 1
                },

                completedCount: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$todo.state", true]
                            },
                            1,
                            0
                        ]
                    }
                },

                // 주간 차트의 시작일과 종료일 표시에 사용할 날짜
                firstDate: {$min: "$todoDate"},
                lastDate: {$max: "$todoDate"}
            }
        },

        // 달성률 계산
        {
            $project: {
                _id: 1,
                totalCount: 1,
                completedCount: 1,
                firstDate: 1,
                lastDate: 1,

                achievementRate: {
                    $cond: [
                        {
                            $eq: ["$totalCount", 0]
                        },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                "$completedCount",
                                                "$totalCount"
                                            ]
                                        },
                                        100
                                    ]
                                },
                                1
                            ]
                        }
                    ]
                }
            }
        },

        // 날짜가 오래된 데이터부터 차트에 표시되도록 정렬
        {
            $sort: {
                firstDate: 1
            }
        }
    ])
}