import React, { useState, useEffect } from "react"
import { io } from 'socket.io-client'
import Topbar from "../components/AdminTopbar.jsx"
import SummaryRow from "../features/home/components/SummaryRow.jsx"
import { getGroupCount } from "../features/home/api/group.js"
import { getUserCount } from "../features/home/api/user.js"
import { getGroup } from "../features/groups/api/group.js"

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

    useEffect(() => {

        async function fetchLogs() {
            const response = await fetch('http://127.0.0.1:3000/admin/logs', { headers: authHeaders() });
            const data = await response.json()
            setLogs(data)
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
                const [groupData, userData] = await Promise.all([
                    getGroupCount(),
                    getUserCount(),
                ])

                setSummary(prev => ({
                    ...prev,
                    groupCount: groupData.count,
                    userCount: userData.count
                }))
            } catch (error) {
                console.error("데이터 조회 실패", error.message)
            }
        }

        fetchSummary()

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

            <div>
                <h2>실시간 접속자</h2>
                <ul>
                    {activeUsers.map(user => (
                        <li key={user.userId}>
                            <img src={`http://127.0.0.1:3000${user.profileImg}`} alt="프로필" width="30" />
                            <span>{user.userName}</span>
                            <span style={{ backgroundColor: user.groupColor || '#ccc', color: '#fff', marginLeft: '10px', padding: '2px 5px', borderRadius: '5px', fontSize: '12px' }}>
                                {user.groupName}
                            </span>
                            <span style={{ marginLeft: '10px' }}>
                                {user.subjectName} 과목 공부 중입니다.
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2>가입 / 탈퇴 실시간 로그</h2>
                <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid #ccc' }}>
                    <ul>
                        {logs.map((log, index) => (
                            <li key={index}>
                                <span style={{ color: log.type === 'SIGNUP' ? 'blue' : 'red' }}>
                                    [{log.type === 'SIGNUP' ? '가입' : '탈퇴'}]
                                </span>
                                {' '}{log.message}
                                <span style={{ color: 'gray', fontSize: '12px', marginLeft: '10px' }}>
                                    ({new Date(log.createdAt).toLocaleString()})
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}