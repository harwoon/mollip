import {useEffect, useRef, useState} from "react"
import {getMemberStatus, sendMemberStatusMail} from "../api/adminUserApi.js"

import styles from "./AdminMemberStatusModal.module.css"
import { FiX } from "react-icons/fi"

// 회원 목록 초기값
const INITIAL_MEMBERS = {
    inactive7: [],
    inactive14: [],
    dormant: []
}

// 체크된 회원 ID 초기값
const INITIAL_SELECTED = {
    inactive7: [],
    inactive14: [],
    dormant: []
}


export default function AdminMemberStatusModal({onClose}) {
    // 타입별 회원 목록
    const [members, setMembers] = useState(INITIAL_MEMBERS)

    // 타입별 선택된 회원 ID
    const [selected, setSelected] = useState(INITIAL_SELECTED)

    // 조회 상태
    const [loading, setLoading] = useState(true)

    // 메일 발송 상태
    const [sending, setSending] = useState(false)

    // 오류 메시지
    const [error, setError] = useState("")

    // React 개발모드 중복 조회 방지
    const isFetched = useRef(false)


    // 관리회원현황 조회
    const fetchMembers = async () => {
        try {
            setLoading(true)
            setError("")

            const data = await getMemberStatus()

            setMembers({
                inactive7: data.inactive7 || [],
                inactive14: data.inactive14 || [],
                dormant: data.dormant || []
            })

            // 새로 조회할 때 기존 선택 초기화
            setSelected(INITIAL_SELECTED)

        } catch (err) {
            setError(
                err.message || "회원 현황을 불러오지 못했습니다."
            )

        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (isFetched.current) {
            return
        }

        isFetched.current = true

        fetchMembers()
    }, [])


    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener(
            "keydown", handleKeyDown
        )

        return () => {
            window.removeEventListener(
                "keydown", handleKeyDown
            )
        }
    }, [onClose])


    // 회원 한 명 선택 또는 해제
    const handleMemberCheck = (type, memberId) => {
        setSelected((prev) => {
            const currentIds = prev[type]

            const isChecked = currentIds.includes(memberId)

            return {
                ...prev,

                [type]: isChecked ? currentIds.filter(
                    (id) => id !== memberId
                ) : [
                    ...currentIds,
                    memberId
                ]
            }
        })
    }


    // 섹션 전체 선택 또는 전체 해제
    const handleSelectAll = (type) => {
        const memberIds = members[type].map(
            (member) => member._id
        )

        const isAllSelected = memberIds.length > 0 && memberIds.every(
            (memberId) =>
                selected[type].includes(
                    memberId
                )
        )

        setSelected((prev) => ({
            ...prev,
            [type]: isAllSelected ? [] : memberIds
        }))
    }

    // 전체 선택 회원 수
    const totalSelectedCount =
        selected.inactive7.length +
        selected.inactive14.length +
        selected.dormant.length

    // 선택한 세 섹션 회원에게 한 번에 메일 발송
    const handleSendMail = async () => {
        if (totalSelectedCount === 0) {
            alert("메일을 발송할 회원을 선택해주세요.")
            return
        }

        const confirmed = window.confirm(
            `선택한 ${totalSelectedCount}명에게 메일을 발송하시겠습니까?`
        )

        if (!confirmed) {
            return
        }

        try {
            setSending(true)
            const result = await sendMemberStatusMail({
                inactive7: selected.inactive7,
                inactive14: selected.inactive14,
                dormant: selected.dormant
            })
            alert(`메일 발송 완료\n성공 ${result.successCount}명\n실패 ${result.failureCount}명`)

            // 발송 후 선택 초기화
            setSelected(INITIAL_SELECTED)

        } catch (err) {
            alert(
                err.message || "메일 발송에 실패했습니다."
            )

        } finally {
            setSending(false)
        }
    }

    return (
        <div
            className={styles.overlay}
            onClick={onClose} // 모달 외부 클릭 시 닫기
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-member-status-title"
                onClick={(event) => event.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
            >
                <header className={styles.header}>
                    <div>
                        <h2 id="admin-member-status-title">관리회원현황</h2>
                        <p>마지막 공부일을 기준으로 관리가 필요한 회원입니다.</p>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="관리회원현황 닫기"
                    >
                        <FiX />
                    </button>
                </header>


                <main className={styles.body}>
                    {loading && (
                        <div className={styles.message}>
                            회원 현황을 불러오는 중입니다.
                        </div>
                    )}

                    {!loading && error && (
                        <div className={`${styles.message} ${styles.error}`}>
                            <p>{error}</p>
                            <button type="button" onClick={fetchMembers}>다시 불러오기</button>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className={styles.sections}>
                            <MemberStatusSection
                                title="최근 7일 미학습 회원"
                                description="마지막 공부일로부터 7일 이상 14일 미만인 회원"
                                type="inactive7"
                                members={members.inactive7}
                                selectedIds={selected.inactive7}
                                onMemberCheck={handleMemberCheck}
                                onSelectAll={handleSelectAll}
                            />

                            <MemberStatusSection
                                title="최근 14일 미학습 회원"
                                description="마지막 공부일로부터 14일 이상 30일 미만인 회원"
                                type="inactive14"
                                members={members.inactive14}
                                selectedIds={selected.inactive14}
                                onMemberCheck={handleMemberCheck}
                                onSelectAll={handleSelectAll}
                            />

                            <MemberStatusSection
                                title="휴면 회원"
                                description="30일 이상 미학습하여 휴면 그룹으로 이동된 회원"
                                type="dormant"
                                members={members.dormant}
                                selectedIds={selected.dormant}
                                onMemberCheck={handleMemberCheck}
                                onSelectAll={handleSelectAll}
                            />
                        </div>
                    )}
                </main>


                <footer className={styles.footer}>
                    <span>총 {totalSelectedCount}명 선택</span>

                    <button
                        type="button"
                        className={styles.sendButton}
                        disabled={
                            totalSelectedCount === 0 ||
                            sending ||
                            loading
                        }
                        onClick={handleSendMail}
                    >
                        {sending ? "메일 발송 중..." : "선택 회원 메일 발송"}
                    </button>
                </footer>
            </div>
        </div>
    )
}


// 타입별 회원 목록 섹션
function MemberStatusSection({
    title,
    description,
    type,
    members,
    selectedIds,
    onMemberCheck,
    onSelectAll
}) {
    // 현재 섹션 전체 선택 여부
    const isAllSelected =
        members.length > 0 &&
        members.every(
            (member) => selectedIds.includes(
                member._id
            )
        )

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                <span className={styles.count}>{members.length}명</span>
            </div>

            <label className={styles.selectAll}>
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    disabled={members.length === 0}
                    onChange={() =>onSelectAll(type)}
                />
                <span>모두 선택</span>
            </label>


            <div className={styles.list}>
                {members.length === 0 ? (
                    <p className={styles.empty}>해당 회원이 없습니다.</p>
                ) : (
                    members.map((member) => (
                        <label
                            key={member._id}
                            className={styles.member}
                        >
                            <input
                                type="checkbox"
                                checked={
                                    selectedIds.includes(member._id)
                                }
                                onChange={() =>onMemberCheck(type, member._id)}
                            />

                            <div className={styles.memberInfo}>
                                {/* 회원 닉네임 */}
                                <span className={styles.memberNickname}>
                                    {member.nickname}
                                </span>

                                {/* 마지막 접속일 */}
                                <span className={styles.memberDate}>
                                    마지막 접속일: {
                                        member.lastStudyDate
                                            ? member.lastStudyDate
                                            : "기록 없음"
                                    }
                                </span>
                            </div>
                        </label>
                    ))
                )}
            </div>


            <div className={styles.selectedCount}>
                선택 {selectedIds.length}명
            </div>
        </section>
    )
}