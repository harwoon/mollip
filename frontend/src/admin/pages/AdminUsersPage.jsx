import { useState, useEffect } from "react"
import { socket } from "../../../util/socket.js"
import Topbar from "../components/AdminTopbar.jsx"
import UsersTable from "../features/users/components/UsersTable.jsx"
import { TotalUser } from "../features/users/components/TotalUser.jsx"
import Pagination from "../components/Pagination.jsx"
import { getUsers, getActiveUsers, getUsersExportData } from "../features/users/api/user.js"
import * as XLSX from "xlsx"
import { AverageTime } from "../features/users/components/AverageTime.jsx"

import "./AdminUsersPage.css"


// 정렬 기준별 설정 (백엔드로 보낼 sortBy 값 + 기본 정렬 방향)
const SORT_OPTIONS = [
    { value: "nickname", label: "닉네임", defaultOrder: "asc" },
    { value: "weeklyStudyTime", label: "이번주 총 공부시간", defaultOrder: "desc" },
    { value: "currentStreak", label: "현재 연속 학습일", defaultOrder: "desc" },
    { value: "maxStreak", label: "최대 연속 학습일", defaultOrder: "desc" },
    { value: "achievementRate", label: "개인 목표 달성률", defaultOrder: "desc" },
    { value: "groupAchievementRate", label: "그룹 목표 달성률", defaultOrder: "desc" },
    { value: "status", label: "상태", defaultOrder: "studying" },
    { value: "createdAt", label: "가입일", defaultOrder: "desc" },
]

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 })

    const [search, setSearch] = useState("")
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortOrder, setSortOrder] = useState("desc")
    const [page, setPage] = useState(1)
    const [activeUserIds, setActiveUserIds] = useState(new Set())

    const isStatusSort = sortBy === "status"

    async function fetchUsers() {
        try {
            const params = { search, sortBy, page, limit: 10 }

            if (isStatusSort) {
                params.status = sortOrder   // "studying" | "resting"
            } else {
                params.sortOrder = sortOrder
            }

            const data = await getUsers(params)
            setUsers(data.users)
            setPagination(data.pagination)
        } catch (err) {
            console.error("회원 목록 조회 실패:", err.message)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [search, sortBy, sortOrder, page])

    // 소켓 연결 (기존과 동일)
    useEffect(() => {
        async function initActiveUsers() {
            try {
                const data = await getActiveUsers()
                setActiveUserIds(new Set(data.activeUserIds))
            } catch (err) {
                console.error("활성 유저 초기 조회 실패:", err.message)
            }
        }

        initActiveUsers()
        socket.connect()
        socket.emit("joinAdminRoom")

        socket.on("adminUserStarted", ({ userId }) => {
            setActiveUserIds(prev => new Set(prev).add(userId))
        })
        socket.on("adminUserStopped", ({ userId }) => {
            setActiveUserIds(prev => {
                const next = new Set(prev)
                next.delete(userId)
                return next
            })
        })

        return () => {
            socket.off("adminUserStarted")
            socket.off("adminUserStopped")
            socket.disconnect()
        }
    }, [])

    function handleSearchChange(e) {
        setPage(1)
        setSearch(e.target.value)
    }

    // 정렬 기준이 바뀌면, 그 기준의 기본 방향으로 자동 세팅
    function handleSortByChange(e) {
        const nextSortBy = e.target.value
        const option = SORT_OPTIONS.find(o => o.value === nextSortBy)

        setPage(1)
        setSortBy(nextSortBy)
        setSortOrder(option.defaultOrder)
    }

    function handleSortOrderChange(e) {
        setPage(1)
        setSortOrder(e.target.value)
    }
    // 컴포넌트 내부에 함수 추가
    async function handleExportExcel() {
        try {
            const params = { search, sortBy }

            if (isStatusSort) {
                params.status = sortOrder
            } else {
                params.sortOrder = sortOrder
            }

            const data = await getUsersExportData(params)

            const rows = data.users.map(user => ({
                "닉네임": user.nickname,
                "이번주 총 공부시간(시간)": Math.floor((user.weeklyStudyTime || 0) / 60),
                "현재 연속 학습일": user.currentStreak,
                "최대 연속 학습일": user.maxStreak,
                "개인 목표 달성률(%)": user.achievementRate,
                "소속 그룹": user.group ? user.group.groupName : "탈퇴",
                "그룹 목표 달성률(%)": user.groupAchievementRate ?? "-",
                "상태": user.isStudying ? "공부중" : "휴식중",
                "가입일": new Date(user.createdAt).toLocaleDateString("ko-KR")
            }))

            const worksheet = XLSX.utils.json_to_sheet(rows)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "회원목록")

            // 날짜 + 시:분:초까지 포함해서 파일명 중복 방지
            const now = new Date()
            const timestamp = now
                .toLocaleString("sv-SE")   // "2026-08-01 21:35:07" 형태 (24시간제, 하이픈/콜론 포함)
                .replace(" ", "_")
                .replace(/:/g, "-")        // "2026-08-01_21-35-07"

            XLSX.writeFile(workbook, `회원목록_${timestamp}.xlsx`)
        } catch (err) {
            alert("엑셀 다운로드에 실패했습니다: " + err.message)
        }
    }

    return (
        <div>
            <Topbar
                title="회원 현황"
                description="서비스에 가입한 회원 목록을 확인할 수 있습니다."
            >
                <div className="usersToolbarActions">
                    <input
                        type="text"
                        className="usersInputbox"
                        placeholder="검색할 닉네임 또는 소속 그룹을 입력하세요."
                        value={search}
                        onChange={handleSearchChange}
                    />

                    <select value={sortBy} onChange={handleSortByChange}>
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {isStatusSort ? (
                        <select value={sortOrder} onChange={handleSortOrderChange}>
                            <option value="studying">공부중</option>
                            <option value="resting">휴식중</option>
                        </select>
                    ) : (
                        <select value={sortOrder} onChange={handleSortOrderChange}>
                            <option value="asc">오름차순</option>
                            <option value="desc">내림차순</option>
                        </select>
                    )}

                    <button type="button" className="createXlsxButton" onClick={handleExportExcel}>
                        엑셀 다운로드
                    </button>
                </div>
            </Topbar>

            <div>
                <TotalUser />
                <AverageTime />
            </div>

            <div className="usersLayout">
                <UsersTable users={users} activeUserIds={activeUserIds} />
                <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
        </div>
    )
}