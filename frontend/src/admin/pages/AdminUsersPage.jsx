import { useState, useEffect } from "react"
import Topbar from "../components/AdminTopbar.jsx"
import UsersTable from "../features/users/components/UsersTable.jsx"
import { getUsers } from "../features/users/api/user.js"

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 0 })

    const [search, setSearch] = useState("")
    const [sortOrder, setSortOrder] = useState("desc")
    const [page, setPage] = useState(1)

    async function fetchUsers() {
        try {
            const data = await getUsers({ search, sortOrder, page, limit: 15 })
            setUsers(data.users)
            setPagination(data.pagination)
        } catch (err) {
            console.error("회원 목록 조회 실패:", err.message)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [search, sortOrder, page])

    function handleSearchChange(e) {
        setPage(1)              // 검색어 바뀌면 1페이지로 초기화
        setSearch(e.target.value)
    }

    function handleSortChange(e) {
        setPage(1)
        setSortOrder(e.target.value)
    }

    return (
        <div>
            <Topbar
                title="회원 조회"
                description="서비스에 가입한 회원 목록을 확인할 수 있습니다."
            >
                <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={search}
                    onChange={handleSearchChange}
                />
                <select value={sortOrder} onChange={handleSortChange}>
                    <option value="desc">최신순</option>
                    <option value="asc">오래된순</option>
                </select>
            </Topbar>

            <div className="usersLayout">
                <UsersTable users={users} />

                <div className="usersPagination">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        이전
                    </button>
                    <span>{pagination.page} / {pagination.totalPages || 1}</span>
                    <button
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    )
}