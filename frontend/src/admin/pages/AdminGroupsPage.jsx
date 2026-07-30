import { useState, useEffect } from "react"
import Topbar from "../components/AdminTopbar.jsx"
// import GroupsTable from "../features/groups/components/GroupsTable.jsx"
import GroupForm from "../features/groups/components/GroupForm.jsx"
import { getGroups } from "../features/groups/api/group.js"
// import "./AdminGroupsPage.css"

export default function AdminGroupsPage() {
    const [groups, setGroups] = useState([])
    const [mode, setMode] = useState(null)          // null | "create" | "edit"
    const [selectedGroup, setSelectedGroup] = useState(null)

    async function fetchGroups() {
        try {
            const data = await getGroups()
            setGroups(data.groups)
        } catch (err) {
            console.error("그룹 목록 조회 실패:", err.message)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    function handleSelectGroup(group) {
        setSelectedGroup(group)
        setMode("edit")
    }

    function handleClickCreate() {
        setSelectedGroup(null)
        setMode("create")
    }

    async function handleFormSuccess() {
        setMode(null)
        setSelectedGroup(null)
        await fetchGroups()
    }

    function handleCancel() {
        setMode(null)
        setSelectedGroup(null)
    }

    return (
        <div>
            <Topbar
                title="그룹 관리"
                description="생성된 모든 그룹을 관리하고 조회할 수 있습니다."
            />      
            <div>
                <div>
                    그룹 테이블 영역
                </div>
                <div>
                    <button className="createGroupButton" onClick={handleClickCreate}>
                        그룹 생성하기
                    </button>
                    <div>
                        {mode ? (
                            <GroupForm
                                mode={mode}
                                group={selectedGroup}
                                onSuccess={handleFormSuccess}
                                onCancel={handleCancel}
                            />
                        ) : (
                            <p className="groupsPanelEmpty">
                                그룹 생성 또는 수정할 그룹을 선택해주세요.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}