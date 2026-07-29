import React from 'react'
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
            if (record.startTime && record.endTime) {
              const start = new Date(record.startTime).getTime()
              const end = new Date(record.endTime).getTime()
              const diffInSeconds = Math.round((end - start) / 1000)
              return sum + diffInSeconds
            }
            return sum
          }, 0)

        const isSelected = selectedSubject?.subjectName === subject.subjectName

        return (
          <div 
            key={subject._id}
            className={`${styles.subjectItem} ${isSelected ? styles.subjectItemActive : ''}`}
            onClick={() => onSelectSubject(subject)}
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

// import React from 'react'
// import styles from './SubjectList.module.css'

// export default function SubjectList({ 
//   subjects, 
//   dailyRecords, 
//   selectedSubject, 
//   onSelectSubject 
// }) {

//   console.log("DB에서 가져온 과목: ", subjects)
  
//   // 1. 초 단위 시간 함수
//   const formatTime = (totalSeconds) => {
//     const h = Math.floor(totalSeconds / 3600)
//     const m = Math.floor((totalSeconds % 3600) / 60)
//     const s = totalSeconds % 60
//     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
//   }

//   const activeSubjects = subjects.filter(subject => subject.useYn === 'Y')

//   return (
//     <div className={styles.listContainer}>
//       {activeSubjects.map((subject) => {
        
//         // 💡 꼼수 삭제! DB에서 가져온 순수한 '초'를 더하기만 합니다.
//         const totalStudyTime = dailyRecords
//           .filter(record => record.studyTitle === subject.subjectName)
//           .reduce((sum, record) => sum + record.sumStudyTime, 0)

//         const isSelected = selectedSubject?.subjectName === subject.subjectName

//         return (
//           <div 
//             key={subject._id}
//             className={`${styles.subjectItem} ${isSelected ? styles.subjectItemActive : ''}`}
//             onClick={() => onSelectSubject(subject)}
//           >
//             <div className={styles.subjectInfo}>
//               <div 
//                 className={styles.colorDot} 
//                 style={{ backgroundColor: subject.subjectColor }} 
//               />
//               <span className={styles.subjectName}>{subject.subjectName}</span>
//             </div>
            
//             <div className={styles.timeDisplay}>
//               {formatTime(totalStudyTime)}
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }