import { buildWeeklyGoalProgress } from "./groupGoal.js"

export function buildGroupMemberGoalRows({
    members = [],
    goals = [],
    studySummaries = [],
    todoSummaries = [],
}) {
    const studySummaryMap = new Map(
        studySummaries.map((summary) => [
            String(summary.userId),
            summary,
        ]),
    )
    const todoSummaryMap = new Map(
        todoSummaries.map((summary) => [
            String(summary.userId),
            summary,
        ]),
    )

    return members.map((member) => {
        const memberId = String(member._id)
        const studySummary = studySummaryMap.get(memberId) || {}
        const todoSummary = todoSummaryMap.get(memberId) || {}
        const { overallAchievementRate } = buildWeeklyGoalProgress(
            goals,
            {
                weeklyStudySeconds:
                    Number(studySummary.weeklyStudySeconds) || 0,
                attendanceDays:
                    Number(studySummary.attendanceDays) || 0,
                todoCompletionRate:
                    Number(todoSummary.todoCompletionRate) || 0,
            },
        )

        return {
            _id: memberId,
            nickname: member.nickname || "",
            profileImg: member.profileImg || "",
            overallAchievementRate,
        }
    })
}
