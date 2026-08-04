import React, { useState, useEffect } from "react"
import { socket } from "../../../util/socket.js"
import Topbar from "../components/AdminTopbar.jsx"
import SummaryRow from "../features/home/components/SummaryRow.jsx"
import { getGroupCount } from "../features/home/api/group.js"
import { getActiveUsers } from "../features/users/api/user.js"
import { getUserCount, getWeeklyTodoAchievement, getLog } from "../features/home/api/user.js"
import { getGroup } from "../features/groups/api/group.js"
import { getTotalTime } from "../features/home/api/study.js"
import { getGroupStudyTime } from "../features/groups/api/group.js"
import GroupStudyTimeChart from "../features/home/components/GroupStudyTimeChart.jsx"

import ActiveUser from "../features/home/components/ActiveUser.jsx"
import RecentUser from "../features/home/components/RecentUser.jsx"
import StudyTrend from "../features/home/components/StudyTrend.jsx"
import GroupGoalAchievement from "../features/groups/components/GroupGoalAchievement.jsx"
import { fetchAdminGroupStatistics } from "../features/groups/api/adminGroupStatisticsApi.js"

export default function AdminHomePage() {
    const [activeUsers, setActiveUsers] = useState([])
    const [logs, setLogs] = useState([])

    const [summary, setSummary] = useState({
        groupCount: 0,
        groupCountDiff: 0,

        totalUserCount: 0,
        userCountDiff: 0,

        studyingCount: 0,
        studyingCountNote: "수정 필요",

        weeklyTotalTime: 0,
        weeklyTotalTimeDiff: "",

        avgGoalRate: 0,
        avgGoalRateDiff: "수정 필요",
    })

    const [groups, setGroups] = useState([])
    const [groupsLoading, setGroupsLoading] = useState(true)
    const [groupsError, setGroupsError] = useState("")

    const [groupStudySummary, setGroupStudySummary] = useState({
        startDate: "",
        endDate: "",
        allGroupsTotalStudyTime: 0,
        groupStatistics: [],
    })

    const [groupStudyLoading, setGroupStudyLoading] = useState(true)
    const [groupStudyError, setGroupStudyError] = useState("")
    useEffect(() => {

        async function fetchLogs() {
            try {
                const data = await getLog()
                setLogs(data)

            } catch (error) {
                console.error("로그 데이터 불러오기 실패:", error)
            }
        }
        fetchLogs()

        socket.connect()
        socket.emit('joinAdminRoom')

        socket.on('newAdminLog', (newLog) => {
            setLogs((prevLogs) => [newLog, ...prevLogs])
        })

        socket.on('adminUserStarted', async (newUser) => {
            try {
                const groupData = await getGroup(newUser.groupId);

                newUser.groupName = groupData.group.groupName
                newUser.groupColor = groupData.group.groupColor

            } catch (error) {
                console.error("그룹 정보 조회 실패:", error)
                newUser.groupName = "알 수 없는 그룹"
                newUser.groupColor = "#999999"
            }

            // API 호출이 끝난 뒤 최종적으로 상태 업데이트
            setActiveUsers((prev) => {
                const isAlreadyActive = prev.some(user => user.userId === newUser.userId)
                if (isAlreadyActive) return prev
                return [...prev, newUser]
            })

            // 공부중 인원수 +1
            setSummary(prev => ({ ...prev, studyingCount: prev.studyingCount + 1 }))
        })

        socket.on('adminUserStopped', ({ userId: stoppedUserId }) => {
            setActiveUsers((prev) => prev.filter(user => user.userId !== stoppedUserId))

            // 공부중 인원수 -1 (0 밑으로는 안 내려가게)
            setSummary(prev => ({ ...prev, studyingCount: Math.max(prev.studyingCount - 1, 0) }))
        })

        async function fetchActiveCount() {
            try {
                const data = await getActiveUsers()
                setSummary(prev => ({
                    ...prev,
                    studyingCount: data.activeUserIds.length
                }))
            } catch (error) {
                console.error("현재 공부중 인원 조회 실패:", error.message)
            }
        }

        async function fetchSummary() {
            try {
                const [groupData, userData, todoAchievementData, totalTimeData] = await Promise.all([
                    getGroupCount(),
                    getUserCount(),
                    getWeeklyTodoAchievement(),
                    getTotalTime()
                ])

                setSummary(prev => ({
                    ...prev,
                    // 운영 중인 그룹 수
                    groupCount:
                        Number(groupData.count) || 0,

                    // 그룹 수 전주 대비 증감
                    groupCountDiff:
                        Number(
                            groupData.groupCountDiff,
                        ) || 0,

                    // 전체 사용자 수
                    totalUserCount:
                        Number(
                            userData.totalUserCount,
                        ) || 0,

                    // 사용자 수 전주 대비 증감
                    userCountDiff:
                        Number(
                            userData.userCountDiff,
                        ) || 0,


                    // 탈퇴 회원 수
                    withdrawnUserCount:
                        Number(
                            userData.withdrawnUserCount,
                        ) || 0,

                    // 휴면 회원을 제외한 정상 회원 수
                    normalUserCount:
                        Number(
                            userData.normalUserCount,
                        ) || 0,


                    // 휴면 그룹 소속 회원 수
                    dormantUserCount:
                        Number(
                            userData.dormantUserCount,
                        ) || 0,

                    // 이번 주 총 공부시간
                    weeklyTotalTime:
                        totalTimeData
                            .currentWeeklyStudyTime,

                    // 이번주 와 저번주 공부시간 차이        
                    weeklyTotalTimeDiff:
                        totalTimeData
                            .weeklyStudyTimeDiff,

                    // 이번 주 전체 Todo 달성률
                    avgGoalRate: todoAchievementData.achievement?.achievementRate || 0
                }))
            } catch (error) {
                console.error("데이터 조회 실패", error.message)
            }
        }

        async function fetchGroupStatistics() {
            try {
                setGroupsLoading(true)
                setGroupsError("")

                const data = await fetchAdminGroupStatistics()
                const groupList = Array.isArray(data.groups) ? data.groups : []
                setGroups(groupList)

            } catch (error) {
                console.error("그룹 목표 달성률 조회 실패:", error)

                setGroups([])

                setGroupsError(error.message || "그룹 목표 달성률을 불러오지 못했습니다.")
            } finally {
                setGroupsLoading(false)
            }
        }
        async function fetchGroupStudySummary() {
            try {
                setGroupStudyLoading(true)
                setGroupStudyError("")

                const data = await getGroupStudyTime()

                setGroupStudySummary({
                    startDate: data.startDate || "",
                    endDate: data.endDate || "",
                    allGroupsTotalStudyTime:
                        Number(data.allGroupsTotalStudyTime) || 0,
                    groupStatistics:
                        Array.isArray(data.groupStatistics)
                            ? data.groupStatistics
                            : [],
                })
            } catch (error) {
                console.error(
                    "그룹별 공부시간 조회 실패:",
                    error,
                )

                setGroupStudyError(
                    error.message ||
                    "그룹별 공부시간을 불러오지 못했습니다.",
                )
            } finally {
                setGroupStudyLoading(false)
            }
        }

        fetchActiveCount()
        fetchSummary()
        fetchGroupStatistics()
        fetchGroupStudySummary()

        return () => {
            socket.off('adminUserStarted')
            socket.off('adminUserStopped')
            socket.off('newAdminLog')
            socket.disconnect()
        }
    }, [])

    return (
        <>
            <div>
                <Topbar
                    title="관리자 대시보드"
                    description="Mollip 서비스 전체 운영 현황을 한눈에 확인하고, 필요한 항목을 관리하세요."
                />
                <SummaryRow summary={summary} />

                <GroupStudyTimeChart
                    summary={groupStudySummary}
                    loading={groupStudyLoading}
                    error={groupStudyError}
                />
            </div>

            <ActiveUser activeUsers={activeUsers} />

            {/* 그룹 목표 달성률 */}
            <div className="groupsAchievementPanel">
                {groupsError && (
                    <p className="groupsAchievementError">
                        {groupsError}
                    </p>
                )}

                <GroupGoalAchievement
                    groups={groups}
                    loading={groupsLoading}
                />
            </div>



            <RecentUser logs={logs} />

            <StudyTrend />
        </>
    )
}