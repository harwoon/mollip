import {useEffect, useRef, useState} from "react"
import {getMemberStatus, sendMemberStatusMail} from "../api/adminUserApi.js"

import AppModal from "../../components/common/AppModal.jsx"
import AppAlert from "../../components/common/AppAlert.jsx"
import styles from "./AdminMemberStatusModal.module.css"
import { FiMail, FiX } from "react-icons/fi"

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

    // 공통 AppAlert
    const [alertConfig, setAlertConfig] = useState({
        open: false,
        type: "info",
        title: "",
        message: "",
        showCancel: false,
        confirmText: "확인",
        onConfirm: null,
    })
    
    const closeAlert = () => {
        setAlertConfig((prev) => ({
            ...prev,
            open: false,
        }))
    }

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


    const sendMail = async () => {
        try {
            closeAlert()
            setSending(true)

            const result = await sendMemberStatusMail({
                inactive7: selected.inactive7,
                inactive14: selected.inactive14,
                dormant: selected.dormant,
            })

            setSelected(INITIAL_SELECTED)

            setAlertConfig({
                open: true,
                type: "success",
                title: "메일 발송 완료",
                message: `성공 ${result.successCount}명 · 실패 ${result.failureCount}명`,
                showCancel: false,
                confirmText: "확인",
                onConfirm: null,
            })
        } catch (err) {
            setAlertConfig({
                open: true,
                type: "danger",
                title: "메일 발송 실패",
                message: err.message || "메일 발송에 실패했습니다.",
                showCancel: false,
                confirmText: "확인",
                onConfirm: null,
            })
        } finally {
            setSending(false)
        }
    }

    // 선택한 세 섹션 회원에게 한 번에 메일 발송
    const handleSendMail = () => {
        if (totalSelectedCount === 0) {
            setAlertConfig({
                open: true,
                type: "warning",
                title: "회원을 선택해주세요.",
                message: "메일을 발송할 회원을 한 명 이상 선택해주세요.",
                showCancel: false,
                confirmText: "확인",
                onConfirm: null,
            })
            return
        }

        setAlertConfig({
            open: true,
            type: "warning",
            title: "선택 회원에게 메일을 발송할까요?",
            message: `선택한 ${totalSelectedCount}명에게 관리 메일을 발송합니다.`,
            showCancel: true,
            confirmText: "발송",
            onConfirm: sendMail,
        })
    }



    return (
        <>
        <AppModal
            open={true}
            type="large"
            title="관리회원현황"
            description="마지막 공부일을 기준으로 관리가 필요한 회원을 확인하고 메일을 발송합니다."
            icon={<FiMail />}
            onClose={onClose}
            footer={
                <div className={styles.footerContent}>
                    <span>총 {totalSelectedCount}명 선택</span>
                    <button
                        type="button"
                        className="app-btn-primary"
                        disabled={totalSelectedCount === 0 || sending || loading}
                        onClick={handleSendMail}
                    >
                        {sending ? "메일 발송 중..." : "선택 회원 메일 발송"}
                    </button>
                </div>
            }
        >
            {loading && (
                <div className="app-modal-state">
                    <div className="app-spinner" aria-hidden="true" />
                    <strong>회원 현황을 불러오고 있어요</strong>
                    <p>잠시만 기다려 주세요.</p>
                </div>
            )}

            {!loading && error && (
                <div className="app-modal-state">
                    <strong>회원 현황을 불러오지 못했습니다.</strong>
                    <p>{error}</p>
                    <button type="button" className="app-btn-secondary" onClick={fetchMembers}>
                        다시 불러오기
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div className={styles.sections}>
                    <MemberStatusSection
                        title="최근 7일 미학습 회원"
                        description="마지막 공부일로부터 7일 이상 14일 미만"
                        type="inactive7"
                        members={members.inactive7}
                        selectedIds={selected.inactive7}
                        onMemberCheck={handleMemberCheck}
                        onSelectAll={handleSelectAll}
                    />
                    <MemberStatusSection
                        title="최근 14일 미학습 회원"
                        description="마지막 공부일로부터 14일 이상 30일 미만"
                        type="inactive14"
                        members={members.inactive14}
                        selectedIds={selected.inactive14}
                        onMemberCheck={handleMemberCheck}
                        onSelectAll={handleSelectAll}
                    />
                    <MemberStatusSection
                        title="휴면 회원"
                        description="30일 이상 미학습하여 휴면 그룹으로 이동"
                        type="dormant"
                        members={members.dormant}
                        selectedIds={selected.dormant}
                        onMemberCheck={handleMemberCheck}
                        onSelectAll={handleSelectAll}
                    />
                </div>
            )}
        </AppModal>

        <AppAlert
            open={alertConfig.open}
            type={alertConfig.type}
            title={alertConfig.title}
            message={alertConfig.message}
            showCancel={alertConfig.showCancel}
            confirmText={alertConfig.confirmText}
            onCancel={closeAlert}
            onClose={closeAlert}
            onConfirm={() => {
                if (alertConfig.onConfirm) {
                    alertConfig.onConfirm()
                    return
                }
                closeAlert()
            }}
        />
        </>
    )
}


function MemberStatusSection({
    title,
    description,
    type,
    members,
    selectedIds,
    onMemberCheck,
    onSelectAll,
}) {
    const isAllSelected =
        members.length > 0 &&
        members.every((member) => selectedIds.includes(member._id))

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                <span className="app-chip">{members.length}명</span>
            </div>

            <label className={styles.selectAll}>
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    disabled={members.length === 0}
                    onChange={() => onSelectAll(type)}
                />
                <span>모두 선택</span>
            </label>

            <div className={`${styles.list} app-scroll`}>
                {members.length === 0 ? (
                    <p className="app-empty">해당 회원이 없습니다.</p>
                ) : (
                    members.map((member) => (
                        <label key={member._id} className={styles.member}>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(member._id)}
                                onChange={() => handleMemberCheckSafe(onMemberCheck, type, member._id)}
                            />
                            <span className={styles.memberName}>{member.nickname}</span>
                            <span className={styles.memberEmail}>{member.email}</span>
                        </label>
                    ))
                )}
            </div>
        </section>
    )
}

// 선택 핸들러
function handleMemberCheckSafe(handler, type, memberId) {
    handler(type, memberId)
}
