// [역할: 내 과목 조회 및 수정]
import { useEffect, useState } from "react"
// import { getMyInfo } from "../../auth/api/auth"
// import { PiPencilSimpleDuotone } from "react-icons/pi"

import { getSubjects, createSubject, updateSubject, deleteSubject } from "../../subject/api/subject"

import styles from "./SubjectInfo.module.css"

// 과목 컬러 5개
const SubjectColorFix = [
    "#EECFEA",
    "#FBDFC2",
    "#C0F1DC",
    "#D3E5FF",
    "#A38EC9"
]


export default function SubjectInfo(){
    // 과목 목록
    const [subjects, setSubjects] = useState([])

    useEffect(() => {
        loadSubjects()
    }, [])

    async function loadSubjects() {
        try{
            const data = await getSubjects()

            // 백엔드 subjects 배열 state에 저장 : subjects 값 없으면 빈 배열
            setSubjects(data.subjects ?? [])
        }catch (error){
            console.error("과목 목록 조회 오류: ", error)
            alert(error.message)
        }
    }

    // 과목명 input 값 변경: 서버요청 x, 화면 표시되는 state 먼저 변경
    function handleSubjectNameChange(subjectId, value) {
        setSubjects((previousSubjects) =>
            previousSubjects.map((subject) =>
                // 변경하려는 과목이면 subjectName만 새로운 값으로 변경
                subject._id === subjectId ? {
                    ...subject,
                    subjectName: value
                } : subject
            )
        )
    }

    // 과목명 input에 focus가 빠지면 서버에 수정
    async function handleSubjectNameBlur(subject) {
        const subjectName = subject.subjectName.trim()

        if(!subjectName){
            alert("과목명을 입력해주세요.")
            await loadSubjects()
            return
        }

        try{
            // 현재 과목명, 기존 색상 서버전송
            const data = await updateSubject(
                subject._id,
                subjectName,
                subject.subjectColor
            )

            // 수정된 과목만 서버 응답 데이터로 교체
            setSubjects((previousSubjects) =>
                previousSubjects.map((item) =>
                    item._id === subject._id ? data.subject : item
                )
            )
        }catch(error) {
            console.error("과목명 수정 오류:", error)
            alert(error.message)

            // 수정 실패시 기존 서버 데이터로 복구
            await loadSubjects()
        }
    }

    // 과목 색상 버튼 클릭 시 서버에 즉시 수정 요청
    async function handleSubjectColorChange(subject, color) {
        try{
            // 기존 과목명, 새로 선택한 색상 서버전송
            const data = await updateSubject(
                subject._id,
                subject.subjectName,
                color
            )
            
            // 수정된 과목만 서버 응답 데이터로 교체
            setSubjects((previousSubjects) =>
                previousSubjects.map((item) =>
                    item._id === subject._id ? data.subject : item
                )
            )
        }catch(error) {
            console.error("과목 색상 수정 오류:", error)
            alert(error.message)
        }
        
    }

    return (
        <section className={styles.subjectInfo}>
            {/* 과목 설정 제목과 현재 등록된 과목 수 */}
            <div className={styles.subjectHeader}>
                <div>
                    <h2>과목 설정</h2>

                    <p>
                        공부할 과목을 최대 5개까지 설정할 수 있습니다.
                    </p>
                </div>

                <span className={styles.subjectCount}>
                    {subjects.length} / 5
                </span>
            </div>

            {/* 과목 설정 안내 문구 */}
            <div className={styles.subjectGuide}>
                과목은 최대 5개까지 설정 가능하며,
                통계 및 대시보드에 반영됩니다.
            </div>

            {/* 등록된 과목 목록 */}
            <div className={styles.subjectList}>
                {subjects.map((subject) => (
                    <div
                        key={subject._id}
                        className={styles.subjectItem}
                    >
                        {/* 추후 드래그 정렬 기능에 사용할 영역 */}
                        <span className={styles.dragHandle}>
                            ⋮⋮
                        </span>

                        {/* 현재 과목에 설정된 대표 색상 */}
                        <span
                            className={styles.subjectCurrentColor}
                            style={{
                                backgroundColor:
                                    subject.subjectColor
                            }}
                        />

                        {/* 과목명은 항상 바로 수정 가능 */}
                        <input
                            type="text"
                            value={subject.subjectName ?? ""}
                            onChange={(event) =>
                                handleSubjectNameChange(
                                    subject._id,
                                    event.target.value
                                )
                            }
                            // input 포커스가 빠질 때 서버에 수정 요청
                            onBlur={() =>
                                handleSubjectNameBlur(subject)
                            }
                            className={styles.subjectNameInput}
                        />

                        <span className={styles.colorLabel}>
                            컬러 선택
                        </span>

                        {/* 선택 가능한 과목 색상 목록 */}
                        <div className={styles.subjectColorList}>
                            {SubjectColorFix.map((color) => {
                                // 현재 과목에 선택된 색상인지 확인
                                const isSelected =
                                    subject.subjectColor === color

                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        className={
                                            isSelected
                                                ? `${styles.colorButton} ${styles.selectedColor}`
                                                : styles.colorButton
                                        }
                                        style={{
                                            backgroundColor: color
                                        }}
                                        // 색상 클릭 시 즉시 서버 수정
                                        onClick={() =>
                                            handleSubjectColorChange(
                                                subject,
                                                color
                                            )
                                        }
                                        aria-label={`${color} 색상 선택`}
                                    >
                                        {/* 현재 선택된 색상에는 체크 표시 */}
                                        {isSelected && "✓"}
                                    </button>
                                )
                            })}
                        </div>

                        {/* 과목 삭제 버튼 */}
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => {
                                // 다음 단계에서 삭제 API 연결
                            }}
                        >
                            삭제
                        </button>
                    </div>
                ))}
            </div>
        </section>
    )
}