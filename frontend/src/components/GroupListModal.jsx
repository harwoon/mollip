import { useEffect, useState } from "react"
import { FiInfo, FiRefreshCw } from "react-icons/fi"

import { getAllGroups } from "../features/group/api/group.js"
import { prepareGroupList } from "../features/group/util/groupList.js"
import AppModal from "./common/AppModal.jsx"

import styles from "./GroupListModal.module.css"


const DORMANT_GROUP_ID = import.meta.env.VITE_DORMANT_GROUP_ID


export default function GroupListModal({ open = false, onClose }) {
    const [groups, setGroups] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [requestKey, setRequestKey] = useState(0)

    useEffect(() => {
        if (!open) {
            return undefined
        }

        let isCurrentRequest = true

        getAllGroups()
            .then((groupList) => {
                if (isCurrentRequest) {
                    setGroups(
                        prepareGroupList(
                            groupList,
                            DORMANT_GROUP_ID,
                            localStorage.getItem("groupId")
                        )
                    )
                }
            })
            .catch((requestError) => {
                if (isCurrentRequest) {
                    setGroups([])
                    setError(
                        requestError?.message ||
                        "그룹 목록을 불러오지 못했습니다."
                    )
                }
            })
            .finally(() => {
                if (isCurrentRequest) {
                    setLoading(false)
                }
            })

        return () => {
            isCurrentRequest = false
        }
    }, [open, requestKey])

    const handleRetry = () => {
        setLoading(true)
        setError("")
        setRequestKey((key) => key + 1)
    }

    return (
        <AppModal
            open={open}
            type="action"
            title="그룹 목록"
            description="그룹별 주간 공부 조건을 확인해 보세요."
            icon={<FiInfo />}
            onClose={onClose}
        >
            {loading && (
                <div className="app-modal-state" role="status">
                    <span className="app-spinner" aria-hidden="true" />
                    <strong>그룹 목록을 불러오고 있어요</strong>
                </div>
            )}

            {!loading && error && (
                <div className="app-modal-state" role="alert">
                    <strong>그룹 목록을 불러오지 못했어요</strong>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="app-btn-secondary"
                        onClick={handleRetry}
                    >
                        <FiRefreshCw aria-hidden="true" />
                        다시 시도
                    </button>
                </div>
            )}

            {!loading && !error && groups.length === 0 && (
                <div className="app-modal-state">
                    <strong>표시할 그룹이 없습니다.</strong>
                </div>
            )}

            {!loading && !error && groups.length > 0 && (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">그룹명</th>
                                <th scope="col">그룹 조건 시간(h)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((group) => (
                                <tr
                                    key={group.id}
                                    className={
                                        group.isCurrent
                                            ? styles.currentGroupRow
                                            : undefined
                                    }
                                >
                                    <th scope="row">
                                        <span
                                            className={styles.colorDot}
                                            style={{ backgroundColor: group.color }}
                                            aria-hidden="true"
                                        />
                                        <span>{group.name}</span>
                                        {group.isCurrent && (
                                            <span className={styles.currentGroupBadge}>
                                                내 그룹
                                            </span>
                                        )}
                                    </th>
                                    <td>
                                        {group.hours.toLocaleString("ko-KR")}시간
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AppModal>
    )
}
