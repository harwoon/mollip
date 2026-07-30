import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const socket = io("http://127.0.0.1:3000", {
    autoConnect: false
})

const StudyTimer = ({ startTime }) => {
    const [timeText, setTimeText] = useState("00:00:00")

    useEffect(() => {

        const interval = setInterval(() => {
            const diff = Date.now() - startTime

            const hours = Math.floor(diff / 3600000)
            const minutes = Math.floor((diff % 3600000) / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)

            setTimeText(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            )
        }, 1000)

        return () => clearInterval(interval)
    }, [startTime])

    return <span style={{ fontWeight: 'bold', color: '#8a6bc7' }}>{timeText}</span>
}

export default function ActiveUsersList({ groupId, userId, userName }) {
    const [activeUsers, setActiveUsers] = useState([])

    useEffect(() => {
        socket.connect()


        socket.emit('joinGroup', { groupId, userId })

        socket.on('currentActiveUsers', (usersMap) => {
            const usersArray = Object.entries(usersMap).map(([id, data]) => ({
                userId: id,
                ...JSON.parse(data)
            }))
            setActiveUsers(usersArray)
        })

        socket.on('userStartedStudy', (newUser) => {
            setActiveUsers((prev) => {

                const isAlreadyActive = prev.some(user => user.userId === newUser.userId);
                if (isAlreadyActive) {
                    return prev
                }
                return [...prev, newUser] // 없을 때만 추가
            })
        })

        socket.on('userStoppedStudy', ({ userId: stoppedUserId }) => {

            setActiveUsers((prev) => prev.filter(user => user.userId !== stoppedUserId))
        })


        return () => {
            socket.off('currentActiveUsers')
            socket.off('userStartedStudy')
            socket.off('userStoppedStudy')
            socket.disconnect()
        }
    }, [groupId, userId])

    // 내 공부 시작 버튼 핸들러
    const handleStart = () => {
        socket.emit('startStudy', { groupId, userId, userName })
    }

    // 내 공부 종료 버튼 핸들러
    const handleStop = () => {
        socket.emit('stopStudy', { groupId, userId })
    }

    return (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px' }}>
            <h3>실시간 접속자</h3>

            {activeUsers.length === 0 ? (
                <p>현재 공부 중인 멤버가 없습니다.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {activeUsers.map((user) => (
                        <li key={user.userId} style={{ marginBottom: '10px' }}>
                            <span > {user.userName}</span>
                            <StudyTimer startTime={user.startTime} />
                        </li>
                    ))}
                </ul>
            )}

            <hr />
            {/* <button onClick={handleStart} style={{ marginRight: '10px' }}>내 공부 시작</button>
            <button onClick={handleStop}>내 공부 종료</button> */}
        </div>
    )
}