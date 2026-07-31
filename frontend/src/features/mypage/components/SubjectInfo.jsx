// [역할: 내 과목 조회 및 수정]
import { useEffect, useState } from "react"
import {createSubject, deleteSubject, getSubjects, updateSubject} from "../../subject/api/subject"
import {PiBookOpen, PiDotsSixVertical, PiInfo, PiPlus, PiTrash, PiX} from "react-icons/pi"

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

    // 현재 드래그 중인 과목의 ID
    const [draggingSubjectId, setDraggingSubjectId] = useState(null)

    // 현재 드래그한 과목이 올라가 있는 대상 과목의 ID
    const [dragOverSubjectId, setDragOverSubjectId] = useState(null)

    // 과목 추가 모달 표시 여부
    const [isAdding, setIsAdding] = useState(false)

    // 추가할 과목 정보
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

    // 로그인한 사용자별로 과목 순서를 따로 저장하기 위한 key
    function getSubjectOrderStorageKey() {
        const userId =
            localStorage.getItem("userId") ||
            "unknown"

        return `mollip-subject-order-${userId}`
    }

    // 현재 과목 배열의 ID 순서를 localStorage에 저장
    function saveSubjectOrder(subjectList) {
        const subjectIds = subjectList.map(
            (subject) => subject._id
        )

        localStorage.setItem(
            getSubjectOrderStorageKey(),
            JSON.stringify(subjectIds)
        )
    }

    // 서버에서 불러온 과목 목록에 저장된 프론트 순서를 적용
    function applySavedSubjectOrder(subjectList) {
        const savedOrderText =
            localStorage.getItem(
                getSubjectOrderStorageKey()
            )

        // 저장된 순서가 없으면 서버에서 받은 목록을 그대로 사용
        if (!savedOrderText) {
            return subjectList
        }

        try {
            const savedSubjectIds =
                JSON.parse(savedOrderText)

            // 저장된 값이 배열이 아니면 서버 목록을 그대로 사용
            if (!Array.isArray(savedSubjectIds)) {
                return subjectList
            }

            // 과목 ID를 기준으로 과목을 찾기 위한 Map
            const subjectMap = new Map(
                subjectList.map((subject) => [
                    subject._id,
                    subject
                ])
            )

            // 저장된 ID 순서대로 과목을 배치
            const orderedSubjects =
                savedSubjectIds
                    .map((subjectId) =>
                        subjectMap.get(subjectId)
                    )
                    .filter(Boolean)

            // 순서 저장 이후 새롭게 추가된 과목
            const unorderedSubjects =
                subjectList.filter(
                    (subject) =>
                        !savedSubjectIds.includes(
                            subject._id
                        )
                )

            return [
                ...orderedSubjects,
                ...unorderedSubjects
            ]
        } catch (error) {
            console.error(
                "저장된 과목 순서 파싱 실패:",
                error
            )

            return subjectList
        }
    }

    // 로그인한 사용자의 과목 목록 조회
    async function loadSubjects() {
        try {
            const data = await getSubjects()

            const loadedSubjects =
                data.subjects ?? []

            // 서버 목록에 브라우저에 저장된 순서를 적용
            const orderedSubjects =
                applySavedSubjectOrder(
                    loadedSubjects
                )

            setSubjects(orderedSubjects)
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
                subject._id !==
                    excludedSubjectId &&
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
                subject._id === subjectId ? {
                    ...subject,
                    subjectName: value
                }: subject
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
                    item._id === subject._id ? data.subject : item
                )
            )
        } catch (error) {
            console.error(
                "과목명 수정 오류:", error
            )

            showAlert(
                error.message || "과목명 수정에 실패했습니다."
            )

            await loadSubjects()
        }
    }

    // 기존 과목 색상 변경
    async function handleSubjectColorChange(subject, color) {
        // 현재 사용 중인 색상을 다시 선택한 경우
        if (subject.subjectColor === color) {
            return
        }

        // 다른 과목에서 사용 중인 색상인지 검사
        if (
            isColorAlreadyUsed(color, subject._id)
        ) {
            showAlert("해당 컬러는 이미 사용 중입니다.")
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
                    item._id === subject._id ? data.subject : item
                )
            )
        } catch (error) {
            console.error(
                "과목 색상 수정 오류:", error
            )

            showAlert(
                error.message || "과목 색상 수정에 실패했습니다."
            )
        }
    }

    // 과목 추가 모달 열기
    function handleOpenAdd() {
        if (subjects.length >= 5) {
            showAlert("과목은 최대 5개까지 설정 가능합니다.")
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
            showAlert("해당 컬러는 이미 사용 중입니다.")
            return
        }

        setNewSubject((previousSubject) => ({
            ...previousSubject,
            subjectColor: color
        }))
    }

    // 새 과목 생성
    async function handleCreateSubject() {
        const subjectName = newSubject.subjectName.trim()

        const subjectColor = newSubject.subjectColor

        if (!subjectName) {
            showAlert("과목명을 입력해주세요.")
            return
        }

        if (!subjectColor) {
            showAlert("과목 색상을 선택해주세요.")
            return
        }

        if (isColorAlreadyUsed(subjectColor)) {
            showAlert("해당 컬러는 이미 사용 중입니다.")
            return
        }

        try {
            const data = await createSubject(
                subjectName,
                subjectColor
            )

            setSubjects((previousSubjects) => {
                const nextSubjects = [
                    ...previousSubjects,
                    data.subject
                ]

                // 새 과목을 마지막 순서로 저장
                saveSubjectOrder(nextSubjects)

                return nextSubjects
            })

            setNewSubject({
                subjectName: "",
                subjectColor: ""
            })

            setIsAdding(false)

            showAlert(
                data.message || "과목이 추가되었습니다."
            )
        } catch (error) {
            console.error(
                "과목 생성 오류:", error
            )

            showAlert(
                error.message || "과목 추가에 실패했습니다."
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

    // 드래그를 시작했을 때 실행
    function handleSubjectDragStart(event, subjectId) {
        // 현재 드래그 중인 과목 ID 저장
        setDraggingSubjectId(subjectId)

        // 브라우저에 이동 동작임을 전달
        event.dataTransfer.effectAllowed = "move"

        // 드래그한 과목 ID를 브라우저 Drag 데이터에 저장
        event.dataTransfer.setData(
            "text/plain",
            subjectId
        )
    }

    // 드래그 중 다른 과목 위로 이동할 때 실행
    function handleSubjectDragOver(event, targetSubjectId) {
        // 기본 동작을 막아야 drop 이벤트가 발생함
        event.preventDefault()

        event.dataTransfer.dropEffect = "move"

        // 자기 자신 위에 올라온 경우
        if (
            draggingSubjectId === targetSubjectId
        ) {
            setDragOverSubjectId(null)
            return
        }

        setDragOverSubjectId(targetSubjectId)
    }

    // 드래그한 항목이 과목 영역을 벗어나면 표시 제거
    function handleSubjectDragLeave(event) {
        const nextElement = event.relatedTarget

        // 같은 과목 내부의 자식 요소로 이동한 경우에는 유지
        if (
            nextElement &&
            event.currentTarget.contains(nextElement)
        ) {
            return
        }
        setDragOverSubjectId(null)
    }

    // 과목 위에 드롭했을 때 배열 순서 변경
    function handleSubjectDrop(event, targetSubjectId) {
        event.preventDefault()

        // state 반영이 늦은 경우를 대비해
        // dataTransfer에 저장한 ID도 함께 확인
        const sourceSubjectId = draggingSubjectId || event.dataTransfer.getData("text/plain")

        // ID가 없거나 자기 자신에게 드롭한 경우
        if (
            !sourceSubjectId || sourceSubjectId === targetSubjectId
        ) {
            setDraggingSubjectId(null)
            setDragOverSubjectId(null)
            return
        }

        setSubjects((previousSubjects) => {
            // 드래그한 과목의 기존 위치
            const sourceIndex =
                previousSubjects.findIndex(
                    (subject) => subject._id === sourceSubjectId
                )

            // 드롭 대상 과목의 기존 위치
            const targetIndex =
                previousSubjects.findIndex(
                    (subject) => subject._id === targetSubjectId
                )

            // 과목 ID를 찾지 못한 경우
            if (
                sourceIndex === -1 || targetIndex === -1
            ) {
                return previousSubjects
            }

            // 기존 state를 직접 수정하지 않도록 복사
            const reorderedSubjects = [
                ...previousSubjects
            ]

            // 드래그한 과목을 기존 위치에서 제거
            const [movedSubject] =
                reorderedSubjects.splice(
                    sourceIndex,
                    1
                )

            // 대상 과목이 있던 순서에 드래그한 과목을 삽입
            reorderedSubjects.splice(targetIndex, 0, movedSubject)

            // 변경된 순서를 브라우저에 저장
            saveSubjectOrder(reorderedSubjects)

            return reorderedSubjects
        })

        // 드래그 관련 상태 초기화
        setDraggingSubjectId(null)
        setDragOverSubjectId(null)
    }

    // 드래그가 종료됐을 때 상태 초기화
    function handleSubjectDragEnd() {
        setDraggingSubjectId(null)
        setDragOverSubjectId(null)
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
            const data = await deleteSubject(subject._id)

            setSubjects((previousSubjects) => {
                const nextSubjects =
                    previousSubjects.filter(
                        (item) => item._id !== subject._id
                    )

                // 삭제된 과목을 순서 데이터에서도 제거
                saveSubjectOrder(nextSubjects)

                return nextSubjects
            })

            showAlert(
                data.message || "과목이 삭제되었습니다."
            )
        } catch (error) {
            console.error(
                "과목 삭제 오류:", error
            )

            showAlert(
                error.message || "과목 삭제에 실패했습니다."
            )
        }
    }

    return (
        <>
            <section className={`commonSection ${styles.subjectInfo}`}>
                {/* 과목 설정 제목 */}
                <header className={styles.subjectHeader}>
                    <div className={styles.headerTitleArea}>
                        <span className={styles.headerIcon}>
                            <PiBookOpen aria-hidden="true" />
                        </span>

                        <div>
                            <h2>과목 설정</h2>
                            <p>공부할 과목을 최대 5개까지 설정할 수 있습니다.</p>
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
                        과목은 최대 5개까지 설정 가능하며, 통계 및 대시보드에 반영됩니다.
                    </span>
                </div>

                {/* 등록된 과목 목록 */}
                <div className={styles.subjectList}>
                    {subjects.map((subject) => {
                        const isDragging = draggingSubjectId === subject._id
                        const isDragOver = dragOverSubjectId === subject._id

                        return (
                            <div
                                key={subject._id}
                                className={`${styles.subjectItem} ${
                                    isDragging ? styles.draggingItem : ""
                                } ${
                                    isDragOver ? styles.dragOverItem : ""
                                }`}

                                onDragOver={(event) =>handleSubjectDragOver(event, subject._id)}
                                onDragLeave={handleSubjectDragLeave}
                                onDrop={(event) => handleSubjectDrop(event, subject._id)}
                            >
                                {/* 드래그 핸들 */}
                                <span 
                                    className={styles.dragHandle}
                                    draggable
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${subject.subjectName} 과목 순서 이동`}
                                    title="드래그하여 과목 순서 변경"
                                    onDragStart={(event) => handleSubjectDragStart(event, subject._id)}
                                    onDragEnd={handleSubjectDragEnd}
                                >
                                    <PiDotsSixVertical aria-hidden="true"/>
                                </span>

                                {/* 현재 선택된 과목 컬러 */}
                                <span 
                                    className={styles.subjectCurrentColor}
                                    style={{backgroundColor: subject.subjectColor}}
                                />

                                {/* 과목명 수정 */}
                                <input
                                    type="text"
                                    value={subject.subjectName ?? ""}
                                    className={styles.subjectNameInput}
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
                                />

                                <span className={styles.colorLabel}>컬러 선택</span>

                                {/* 과목 컬러 선택 */}
                                <div className={styles.subjectColorList}>
                                    {SubjectColorFix.map(
                                        (color) => {
                                            const isSelected = subject.subjectColor === color
                                            const isUsed = isColorAlreadyUsed(color, subject._id)

                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`${styles.colorButton} ${
                                                        isSelected ? styles.selectedColor : ""
                                                    } ${
                                                        isUsed ? styles.usedColor : ""
                                                    }`}
                                                    style={{backgroundColor: color}}
                                                    onClick={() => handleSubjectColorChange(subject, color)}
                                                    aria-label={`${color} 색상 선택`}
                                                    aria-pressed={isSelected}
                                                >
                                                    {isSelected && "✓"}
                                                </button>
                                            )
                                        }
                                    )}
                                </div>

                                {/* 과목 삭제 */}
                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    onClick={() => handleDeleteSubject(subject)}
                                    aria-label={`${subject.subjectName} 과목 삭제`}
                                >
                                    <PiTrash aria-hidden="true"/>
                                </button>
                            </div>
                        )
                    })}

                    {/* 최대 5개까지 과목 추가 영역 표시 */}
                    {Array.from({
                        length: Math.max(5 - subjects.length, 0)
                    }).map((_, index) => (
                        <button
                            key={`empty-subject-${index}`}
                            type="button"
                            className={styles.emptySubjectItem}
                            onClick={handleOpenAdd}
                        >
                            <span className={styles.emptySubjectIcon}>
                                <PiPlus aria-hidden="true"/>
                            </span>
                            <span>과목 추가하기</span>
                        </button>
                    ))}
                </div>

                <footer className={styles.subjectFooter}>
                    <PiDotsSixVertical aria-hidden="true"/>
                    <span>드래그하여 순서를 변경할 수 있습니다.</span>
                </footer>
            </section>

            {/* 과목 추가 모달 */}
            {isAdding && (
                <div
                    className={styles.modalOverlay}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
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

                        <h2 id="add-subject-title" className={styles.modalTitle}>
                            과목 추가하기
                        </h2>

                        <label className={styles.modalLabel} htmlFor="new-subject-name">
                            과목명
                        </label>

                        <input
                            id="new-subject-name"
                            type="text"
                            placeholder="과목명을 입력해주세요."
                            value={newSubject.subjectName}
                            onChange={handleNewSubjectNameChange}
                            className={styles.modalInput}
                            autoFocus
                            maxLength={20}
                        />

                        <fieldset className={styles.modalColorSection}>
                            <legend>컬러 선택</legend>

                            <div className={styles.modalColorList}>
                                {SubjectColorFix.map(
                                    (color) => {
                                        const isSelected = newSubject.subjectColor === color
                                        const isUsed = isColorAlreadyUsed(color)

                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`${styles.modalColorButton} ${
                                                    isSelected ? styles.selectedColor : ""
                                                } ${
                                                    isUsed ? styles.usedColor : ""
                                                }`}
                                                style={{backgroundColor: color}}
                                                onClick={() => handleNewSubjectColorChange(color)
                                                }
                                                aria-label={`${color} 색상 선택`}
                                                aria-pressed={isSelected}
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
                                className={styles.cancelCreateButton}
                                onClick={handleCancelCreate}
                            >
                                취소
                            </button>

                            <button
                                type="button"
                                className={styles.completeCreateButton}
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
                <div className={styles.alertOverlay} role="presentation">
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
                                className={styles.alertCloseButton}
                                onClick={() => setAlertMessage("")}
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
                                className={styles.alertConfirmButton}
                                onClick={() => setAlertMessage("")}
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