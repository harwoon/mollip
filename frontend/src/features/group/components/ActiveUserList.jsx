import React, { useState, useEffect } from 'react'
import { socket } from '../../../../util/socket'

import { FiClock, FiUsers } from "react-icons/fi"
import styles from "./ActiveUserList.module.css"

const API_URL = import.meta.env.VITE_LOCAL_API_URL

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

    return (
        <span className={styles.studyTimer}>
            <FiClock aria-hidden="true" />
            {timeText}
        </span>
    )
}

export default function ActiveUsersList({ groupId, userId, userName, profileImg }) {
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


    return (
        <section className={`commonSection ${styles.container}`}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <FiUsers aria-hidden="true" />
                    <h2 className={styles.title}>접속자</h2>
                </div>

                <span className={styles.userCount}>
                    {activeUsers.length}명 공부 중
                </span>
            </header>

            {activeUsers.length === 0 ? (
                <div className={styles.emptyState}>현재 공부 중인 멤버가 없습니다.</div>
            ) : (
                <ul className={styles.userList}>
                    {activeUsers.map((user) => (
                        <li
                            key={user.userId}
                            className={styles.userItem}
                        >
                            <img
                                className={styles.profileImage}
                                src={
                                    user.profileImg
                                        ? `${API_URL}${user.profileImg}`
                                        : "/images/noprofile.png"
                                }
                                alt={`${user.userName} 프로필`}
                                onError={(event) => {
                                    event.currentTarget.src =
                                        "/images/noprofile.png"
                                }}
                            />

                            <span className={styles.userName}>
                                {user.userName}
                            </span>

                            <StudyTimer
                                startTime={user.startTime}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}