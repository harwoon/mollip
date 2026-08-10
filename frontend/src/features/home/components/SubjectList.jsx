import styles from './SubjectList.module.css'

export default function SubjectList({
    subjects,
    dailyRecords,
    selectedSubject,
    onSelectSubject
}) {

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const activeSubjects = subjects.filter(subject => subject.useYn === 'Y')

    return (
        <div className={styles.listContainer}>
            {activeSubjects.map((subject) => {
                const totalStudySeconds = dailyRecords
                    .filter(record => record.studyTitle === subject.subjectName)
                    .reduce((sum, record) => {
                        return sum + (record.sumStudyTime || 0)
                    }, 0)

                const isSelected = selectedSubject?.subjectName === subject.subjectName

                return (
                    <div
                        key={subject._id}
                        className={`${styles.subjectItem} ${isSelected ? styles.subjectItemActive : ''}`}
                        onClick={() => onSelectSubject(subject)}
                        onDoubleClick={() => onSelectSubject(null)}
                    >
                        <div className={styles.subjectInfo}>
                            <div
                                className={styles.colorDot}
                                style={{ backgroundColor: subject.subjectColor }}
                            />
                            <span className={styles.subjectName}>{subject.subjectName}</span>
                        </div>

                        <div className={styles.timeDisplay}>
                            {formatTime(totalStudySeconds)}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
