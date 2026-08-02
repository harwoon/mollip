import React, { useState, useEffect } from "react"
import { io } from 'socket.io-client'
import Topbar from "../components/AdminTopbar.jsx"
import SummaryRow from "../features/home/components/SummaryRow.jsx"
import { getGroupCount } from "../features/home/api/group.js"
import { getUserCount, getWeeklyTodoAchievement, getLog } from "../features/home/api/user.js"
import { getGroup } from "../features/groups/api/group.js"

import ActiveUser from "../features/home/components/ActiveUser.jsx"
import RecentUser from "../features/home/components/RecentUser.jsx"
import GroupGoalAchievement from "../features/groups/components/GroupGoalAchievement.jsx"
import {fetchAdminGroupStatistics} from "../features/groups/api/adminGroupStatisticsApi.js"

const socket = io("http://127.0.0.1:3000", { autoConnect: false })

export default function AdminHomePage() {
    const [activeUsers, setActiveUsers] = useState([])
    const [logs, setLogs] = useState([])

    const [summary, setSummary] = useState({
        groupCount: 0,
        groupCountDiff: "수정 필요",
        userCount: 0,
        userCountDiff: "수정 필요",
        studyingCount: 0,
        studyingCountNote: "수정 필요",
        weeklyTotalTime: "수정 필요",
        weeklyTotalTimeDiff: "수정 필요",
        avgGoalRate: 0,
        avgGoalRateDiff: "수정 필요",
    })

    const [groups, setGroups] = useState([])
    const [groupsLoading, setGroupsLoading] = useState(true)
    const [groupsError, setGroupsError] = useState("")

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
        })

        socket.on('adminUserStopped', ({ userId: stoppedUserId }) => {
            setActiveUsers((prev) => prev.filter(user => user.userId !== stoppedUserId))
        })

        async function fetchSummary() {
            try {
                const [groupData, userData, todoAchievementData] = await Promise.all([
                    getGroupCount(),
                    getUserCount(),
                    getWeeklyTodoAchievement()
                ])

                setSummary(prev => ({
                    ...prev,
                    groupCount: groupData.count,
                    userCount: userData.count,
                    avgGoalRate: todoAchievementData.achievement.achievementRate
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

        fetchSummary()
        fetchGroupStatistics()

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
                    title="관리자 홈"
                    description="Mollip 서비스 전체 운영 현황을 한눈에 확인하고, 필요한 항목을 관리하세요."
                />
                <SummaryRow summary={summary} />
            </div>

            <ActiveUser activeUsers={activeUsers}/>
        
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

            <RecentUser logs={logs}/>
        </>
    )
}