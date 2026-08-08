import { useEffect, useState } from "react"

import MyGroup from "../features/group/components/MyGroup"
import HigherGroup from "../features/group/components/HigherGroup"
import LowerGroup from "../features/group/components/LowerGroup"
import ActiveUserList from "../features/group/components/ActiveUserList"
import GroupRanking from "../features/group/components/GroupRanking"
import GroupGoalSection from "../features/group/components/GroupGoalSection"

import { getMyInfo } from "../features/auth/api/auth"

import styles from "./GroupPage.module.css"

export default function GroupPage() {
    const [userInfo, setUserInfo] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                const data = await getMyInfo()

                setUserInfo(data.user)
            } catch (error) {
                console.error(
                    "사용자 정보 불러오기 실패:",
                    error
                )
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserInfo()
    }, [])

    if (isLoading) {
        return (
            <main className="app-page app-page--fixed">
                <div className="loading-state">
                    그룹 정보를 불러오는 중입니다.
                </div>
            </main>
        )
    }

    if (!userInfo) {
        return (
            <main className="app-page app-page--fixed">
                <div className="loading-state">
                    사용자 정보를 찾을 수 없습니다.
                </div>
            </main>
        )
    }

    return (
        <main className="app-page app-page--fixed">
            <div
                className={`app-page__inner ${styles.groupPage}`}
            >
                {/* 상단 그룹 정보 */}
                <div className={styles.topRow}>
                    <section className={styles.goalArea}>
                        <GroupGoalSection />
                    </section>

                    <section className={styles.myGroupArea}>
                        <MyGroup />
                    </section>

                    <div className={styles.compareArea}>
                        <section className={styles.compareItem}>
                            <HigherGroup />
                        </section>

                        <section className={styles.compareItem}>
                            <LowerGroup />
                        </section>
                    </div>
                </div>

                {/* 하단 랭킹 및 실시간 공부 사용자 */}
                <div className={styles.bottomRow}>
                    <section className={styles.rankingArea}>
                        <GroupRanking />
                    </section>

                    <section className={styles.activeArea}>
                        <ActiveUserList
                            groupId={userInfo.groupId}
                            userId={userInfo._id}
                            userName={userInfo.nickname}
                            profileImg={userInfo.profileImg}
                        />
                    </section>
                </div>
            </div>
        </main>
    )
}