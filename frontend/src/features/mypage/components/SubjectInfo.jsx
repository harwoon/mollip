// [역할: 내 과목 조회 및 수정]
import { useEffect, useState } from "react"

import {
    createSubject,
    deleteSubject,
    getSubjects,
    updateSubject
} from "../../subject/api/subject"

import {
    PiBookOpen,
    PiDotsSixVertical,
    PiInfo,
    PiPlus,
    PiTrash,
    PiX
} from "react-icons/pi"

import styles from "./SubjectInfo.module.css"

// 과목 컬러 5개
const SubjectColorFix = [
    "#EECFEA",
    "#FBDFC2",
    "#C0F1DC",
    "#D3E5FF",
    "#A38EC9"
]

export default function SubjectInfo() {
    // 과목 목록
    const [subjects, setSubjects] = useState([])

    // 과목 추가 모달 표시 여부
    const [isAdding, setIsAdding] = useState(false)

    // 추가할 과목정보
    const [newSubject, setNewSubject] = useState({
        subjectName: "",
        subjectColor: ""
    })

    // 커스텀 알림창 메시지
    const [alertMessage, setAlertMessage] = useState("")

    // 컴포넌트가 처음 화면에 나타날 때 목록 조회
    useEffect(() => {
        loadSubjects()
    }, [])

    // ESC 키로 알림창 또는 과목 추가 모달 닫기
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key !== "Escape") {
                return
            }

            if (alertMessage) {
                setAlertMessage("")
                return
            }

            if (isAdding) {
                handleCancelCreate()
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        )

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            )
        }
    }, [alertMessage, isAdding])

    // 로그인한 사용자 과목 목록 조회
    async function loadSubjects() {
        try {
            const data = await getSubjects()

            setSubjects(data.subjects ?? [])
        } catch (error) {
            console.error(
                "과목 목록 조회 오류:",
                error
            )

            setAlertMessage(
                error.message ||
                "과목 목록을 불러오지 못했습니다."
            )
        }
    }

    // 커스텀 알림 표시
    function showAlert(message) {
        setAlertMessage(message)
    }

    // 해당 색상을 사용하는 다른 과목이 있는지 확인
    function isColorAlreadyUsed(
        color,
        excludedSubjectId = null
    ) {
        return subjects.some(
            (subject) =>
                subject._id !== excludedSubjectId &&
                subject.subjectColor === color
        )
    }

    // 과목명 input 값 변경
    function handleSubjectNameChange(
        subjectId,
        value
    ) {
        setSubjects((previousSubjects) =>
            previousSubjects.map((subject) =>
                subject._id === subjectId
                    ? {
                        ...subject,
                        subjectName: value
                    }
                    : subject
            )
        )
    }

    // 과목명 input에서 focus가 빠지면 서버에 수정
    async function handleSubjectNameBlur(subject) {
        const subjectName =
            subject.subjectName.trim()

        if (!subjectName) {
            showAlert("과목명을 입력해주세요.")
            await loadSubjects()
            return
        }

        try {
            const data = await updateSubject(
                subject._id,
                subjectName,
                subject.subjectColor
            )

            setSubjects((previousSubjects) =>
                previousSubjects.map((item) =>
                    item._id === subject._id
                        ? data.subject
                        : item
                )
            )
        } catch (error) {
            console.error(
                "과목명 수정 오류:",
                error
            )

            showAlert(
                error.message ||
                "과목명 수정에 실패했습니다."
            )

            await loadSubjects()
        }
    }

    // 기존 과목 색상 변경
    async function handleSubjectColorChange(
        subject,
        color
    ) {
        // 현재 과목에서 이미 선택된 색상은 요청하지 않음
        if (subject.subjectColor === color) {
            return
        }

        // 다른 과목에서 사용 중인 색상인지 검사
        if (
            isColorAlreadyUsed(
                color,
                subject._id
            )
        ) {
            showAlert(
                "해당 컬러는 이미 사용 중입니다."
            )
            return
        }

        try {
            const data = await updateSubject(
                subject._id,
                subject.subjectName,
                color
            )

            setSubjects((previousSubjects) =>
                previousSubjects.map((item) =>
                    item._id === subject._id
                        ? data.subject
                        : item
                )
            )
        } catch (error) {
            console.error(
                "과목 색상 수정 오류:",
                error
            )

            showAlert(
                error.message ||
                "과목 색상 수정에 실패했습니다."
            )
        }
    }

    // 과목 추가 모달 열기
    function handleOpenAdd() {
        if (subjects.length >= 5) {
            showAlert(
                "과목은 최대 5개까지 설정 가능합니다."
            )
            return
        }

        setNewSubject({
            subjectName: "",
            subjectColor: ""
        })

        setIsAdding(true)
    }

    // 새 과목명 input 값 변경
    function handleNewSubjectNameChange(event) {
        setNewSubject((previousSubject) => ({
            ...previousSubject,
            subjectName: event.target.value
        }))
    }

    // 새 과목 색상 선택
    function handleNewSubjectColorChange(color) {
        if (isColorAlreadyUsed(color)) {
            showAlert(
                "해당 컬러는 이미 사용 중입니다."
            )
            return
        }

        setNewSubject((previousSubject) => ({
            ...previousSubject,
            subjectColor: color
        }))
    }

    // 새 과목 생성
    async function handleCreateSubject() {
        const subjectName =
            newSubject.subjectName.trim()

        const subjectColor =
            newSubject.subjectColor

        if (!subjectName) {
            showAlert("과목명을 입력해주세요.")
            return
        }

        if (!subjectColor) {
            showAlert("과목 색상을 선택해주세요.")
            return
        }

        if (isColorAlreadyUsed(subjectColor)) {
            showAlert(
                "해당 컬러는 이미 사용 중입니다."
            )
            return
        }

        try {
            const data = await createSubject(
                subjectName,
                subjectColor
            )

            setSubjects((previousSubjects) => [
                ...previousSubjects,
                data.subject
            ])

            setNewSubject({
                subjectName: "",
                subjectColor: ""
            })

            setIsAdding(false)

            showAlert(
                data.message ||
                "과목이 추가되었습니다."
            )
        } catch (error) {
            console.error(
                "과목 생성 오류:",
                error
            )

            showAlert(
                error.message ||
                "과목 추가에 실패했습니다."
            )
        }
    }

    // 과목 추가 취소
    function handleCancelCreate() {
        setNewSubject({
            subjectName: "",
            subjectColor: ""
        })

        setIsAdding(false)
    }

    // 기존 과목 삭제
    async function handleDeleteSubject(subject) {
        const confirmed = window.confirm(
            `"${subject.subjectName}" 과목을 삭제하시겠습니까?`
        )

        if (!confirmed) {
            return
        }

        try {
            const data = await deleteSubject(
                subject._id
            )

            setSubjects((previousSubjects) =>
                previousSubjects.filter(
                    (item) =>
                        item._id !== subject._id
                )
            )

            showAlert(
                data.message ||
                "과목이 삭제되었습니다."
            )
        } catch (error) {
            console.error(
                "과목 삭제 오류:",
                error
            )

            showAlert(
                error.message ||
                "과목 삭제에 실패했습니다."
            )
        }
    }

    return (
        <>
            <section
                className={`commonSection ${styles.subjectInfo}`}
            >
                {/* 과목 설정 제목 */}
                <header className={styles.subjectHeader}>
                    <div className={styles.headerTitleArea}>
                        <span className={styles.headerIcon}>
                            <PiBookOpen aria-hidden="true" />
                        </span>

                        <div>
                            <h2>과목 설정</h2>

                            <p>
                                공부할 과목을 최대 5개까지
                                설정할 수 있습니다.
                            </p>
                        </div>
                    </div>

                    <span className={styles.subjectCount}>
                        {subjects.length} / 5
                    </span>
                </header>

                {/* 과목 설정 안내 문구 */}
                <div className={styles.subjectGuide}>
                    <PiInfo aria-hidden="true" />

                    <span>
                        과목은 최대 5개까지 설정 가능하며,
                        통계 및 대시보드에 반영됩니다.
                    </span>
                </div>

                {/* 등록된 과목 목록 */}
                <div className={styles.subjectList}>
                    {subjects.map((subject) => (
                        <div
                            key={subject._id}
                            className={styles.subjectItem}
                        >
                            <span className={styles.dragHandle}>
                                <PiDotsSixVertical
                                    aria-hidden="true"
                                />
                            </span>

                            <span
                                className={
                                    styles.subjectCurrentColor
                                }
                                style={{
                                    backgroundColor:
                                        subject.subjectColor
                                }}
                            />

                            <input
                                type="text"
                                value={
                                    subject.subjectName ?? ""
                                }
                                onChange={(event) =>
                                    handleSubjectNameChange(
                                        subject._id,
                                        event.target.value
                                    )
                                }
                                onBlur={() =>
                                    handleSubjectNameBlur(
                                        subject
                                    )
                                }
                                className={
                                    styles.subjectNameInput
                                }
                            />

                            <span className={styles.colorLabel}>
                                컬러 선택
                            </span>

                            <div
                                className={
                                    styles.subjectColorList
                                }
                            >
                                {SubjectColorFix.map(
                                    (color) => {
                                        const isSelected =
                                            subject.subjectColor ===
                                            color

                                        const isUsed =
                                            isColorAlreadyUsed(
                                                color,
                                                subject._id
                                            )

                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`${styles.colorButton} ${
                                                    isSelected
                                                        ? styles.selectedColor
                                                        : ""
                                                } ${
                                                    isUsed
                                                        ? styles.usedColor
                                                        : ""
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        color
                                                }}
                                                onClick={() =>
                                                    handleSubjectColorChange(
                                                        subject,
                                                        color
                                                    )
                                                }
                                                aria-label={`${color} 색상 선택`}
                                                aria-pressed={
                                                    isSelected
                                                }
                                            >
                                                {isSelected && "✓"}
                                            </button>
                                        )
                                    }
                                )}
                            </div>

                            <button
                                type="button"
                                className={
                                    styles.deleteButton
                                }
                                onClick={() =>
                                    handleDeleteSubject(
                                        subject
                                    )
                                }
                                aria-label={`${subject.subjectName} 과목 삭제`}
                            >
                                <PiTrash aria-hidden="true" />
                            </button>
                        </div>
                    ))}

                    {/* 비어 있는 과목 슬롯 */}
                    {Array.from({
                        length:
                            Math.max(
                                5 - subjects.length,
                                0
                            )
                    }).map((_, index) => (
                        <button
                            key={`empty-subject-${index}`}
                            type="button"
                            className={
                                styles.emptySubjectItem
                            }
                            onClick={handleOpenAdd}
                        >
                            <span
                                className={
                                    styles.emptySubjectIcon
                                }
                            >
                                <PiPlus aria-hidden="true" />
                            </span>

                            <span>과목 추가하기</span>
                        </button>
                    ))}
                </div>

                <footer className={styles.subjectFooter}>
                    <PiDotsSixVertical aria-hidden="true" />

                    <span>
                        드래그하여 순서를 변경할 수 있습니다.
                    </span>
                </footer>
            </section>

            {/* 과목 추가 모달 */}
            {isAdding && (
                <div
                    className={styles.modalOverlay}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            handleCancelCreate()
                        }
                    }}
                >
                    <section
                        className={styles.addModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-subject-title"
                    >
                        <button
                            type="button"
                            className={styles.modalCloseButton}
                            onClick={handleCancelCreate}
                            aria-label="과목 추가 창 닫기"
                        >
                            <PiX aria-hidden="true" />
                        </button>

                        <h2
                            id="add-subject-title"
                            className={styles.modalTitle}
                        >
                            과목 추가하기
                        </h2>

                        <label
                            className={styles.modalLabel}
                            htmlFor="new-subject-name"
                        >
                            과목명
                        </label>

                        <input
                            id="new-subject-name"
                            type="text"
                            placeholder="과목명을 입력해주세요."
                            value={newSubject.subjectName}
                            onChange={
                                handleNewSubjectNameChange
                            }
                            className={styles.modalInput}
                            autoFocus
                            maxLength={20}
                        />

                        <fieldset
                            className={
                                styles.modalColorSection
                            }
                        >
                            <legend>컬러 선택</legend>

                            <div
                                className={
                                    styles.modalColorList
                                }
                            >
                                {SubjectColorFix.map(
                                    (color) => {
                                        const isSelected =
                                            newSubject.subjectColor ===
                                            color

                                        const isUsed =
                                            isColorAlreadyUsed(
                                                color
                                            )

                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`${styles.modalColorButton} ${
                                                    isSelected
                                                        ? styles.selectedColor
                                                        : ""
                                                } ${
                                                    isUsed
                                                        ? styles.usedColor
                                                        : ""
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        color
                                                }}
                                                onClick={() =>
                                                    handleNewSubjectColorChange(
                                                        color
                                                    )
                                                }
                                                aria-label={`${color} 색상 선택`}
                                                aria-pressed={
                                                    isSelected
                                                }
                                            >
                                                {isSelected && "✓"}
                                            </button>
                                        )
                                    }
                                )}
                            </div>
                        </fieldset>

                        <div className={styles.modalButtonArea}>
                            <button
                                type="button"
                                className={
                                    styles.cancelCreateButton
                                }
                                onClick={handleCancelCreate}
                            >
                                취소
                            </button>

                            <button
                                type="button"
                                className={
                                    styles.completeCreateButton
                                }
                                onClick={handleCreateSubject}
                            >
                                추가하기
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {/* 커스텀 알림창 */}
            {alertMessage && (
                <div
                    className={styles.alertOverlay}
                    role="presentation"
                >
                    <section
                        className={styles.alertModal}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="subject-alert-title"
                    >
                        <div className={styles.alertHeader}>
                            <strong id="subject-alert-title">
                                알림
                            </strong>

                            <button
                                type="button"
                                className={
                                    styles.alertCloseButton
                                }
                                onClick={() =>
                                    setAlertMessage("")
                                }
                                aria-label="알림 닫기"
                            >
                                <PiX aria-hidden="true" />
                            </button>
                        </div>

                        <p className={styles.alertMessage}>
                            {alertMessage}
                        </p>

                        <div className={styles.alertButtonArea}>
                            <button
                                type="button"
                                className={
                                    styles.alertConfirmButton
                                }
                                onClick={() =>
                                    setAlertMessage("")
                                }
                            >
                                확인
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    )
}