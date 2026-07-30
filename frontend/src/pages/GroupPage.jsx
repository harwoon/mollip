import React, { useState, useEffect } from 'react'
import MyGroup from "../features/group/components/MyGroup"
import HigherGroup from "../features/group/components/HigherGroup"
import LowerGroup from "../features/group/components/LowerGroup"
import ActiveUserList from "../features/group/components/ActiveUserList"
import { getMyInfo } from "../features/auth/api/auth"

export default function GroupPage() {
    const [userInfo, setUserInfo] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const data = await getMyInfo()
                setUserInfo(data.user)
            } catch (error) {
                console.error("유저 정보 불러오기 실패:", error);
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserInfo()
    }, [])

    if (isLoading) {
        return <div>로딩 중...</div>; 
    }

    if (!userInfo) {
        return <div>유저 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <>
            <MyGroup />
            <HigherGroup />
            <LowerGroup />
            <ActiveUserList 
                groupId={userInfo.groupId} 
                userId={userInfo._id} 
                userName={userInfo.nickname} 
            />
        </>
    );
}