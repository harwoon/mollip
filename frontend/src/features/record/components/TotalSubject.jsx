import React, { useState, useEffect, useMemo } from "react";
import { getSubjectRecord } from "../api/study.js";
import dayjs from "dayjs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import styles from "./TotalSubject.module.css";

export default function TotalSubject({ selectedDate, type }) {
  const [hour, setHour] = useState(0);
  const [min, setMin] = useState(0);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");

        // API 요청
        const data = await getSubjectRecord(type, formattedDate);

        // 1. DB에서 넘어온 데이터는 '초(Seconds)' 입니다. (예: 196초)
        const totalSeconds = data.totalStudyTime || 0;

        // 2. 초를 60으로 나눠서 '분' 단위로 완전히 내림 처리합니다. (예: 196 / 60 = 3분)
        const totalMinutes = Math.floor(totalSeconds / 60);

        // 3. 계산된 '분'을 시간과 분으로 쪼갭니다.
        setHour(Math.floor(totalMinutes / 60));
        setMin(totalMinutes % 60);

        setSubjects(data.subjects || []);
      } catch (error) {
        console.error("과목공부 시간을 가져오는데 실패했습니다:", error);
        setHour(0);
        setMin(0);
        setSubjects([]);
      }
    };

    fetchStudyTime();
  }, [selectedDate, type]);

  const hasSubjectData = subjects.length > 0;

  const chartData = useMemo(() => {
    if (hasSubjectData) {
      return subjects;
    }
    return [
      {
        studyTitle: "공부 기록 없음",
        ratio: 100,
        subjectColor: "#ece8f7",
      },
    ];
  }, [subjects, hasSubjectData]);

  return (
    <section className={`commonSection ${styles.container}`}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>과목별 공부시간</h3>

          <p className={styles.description}>과목별 학습 비중</p>
        </div>

        <strong className={styles.totalTime}>
          {String(hour).padStart(2, "0")}시간 {String(min).padStart(2, "0")}분
        </strong>
      </div>

      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="ratio"
              nameKey="studyTitle"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              stroke="none"
              isAnimationActive={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.subjectColor} />
              ))}
            </Pie>

            {hasSubjectData && (
              <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            )}
          </PieChart>
        </ResponsiveContainer>

        {!hasSubjectData && (
          <div className={styles.emptyState}>
            <span>공부 기록</span>
            <strong>없음</strong>
          </div>
        )}
      </div>
    </section>
  )
}

// import React, { useState, useEffect, useMemo} from 'react'
// import { getSubjectRecord } from '../api/study.js'
// import dayjs from 'dayjs'
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

// export default function TotalSubject({ selectedDate, type }) {
//   const [hour, setHour] = useState(0)
//   const [min, setMin] = useState(0)
//   const [subjects, setSubjects] = useState([])

//   useEffect(() => {
//     const fetchStudyTime = async () => {
//       try {
//         const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD')

//         // API 요청
//         const data = await getSubjectRecord(type, formattedDate)

//         const totalMinutes = data.totalStudyTime || 0

//         setHour(Math.floor(totalMinutes / 60))
//         setMin(totalMinutes % 60)

//         setSubjects(data.subjects || [])

//       } catch (error) {
//         console.error("과목공부 시간을 가져오는데 실패했습니다:", error)
//         // 조회 실패 시 초기화
//         setHour(0)
//         setMin(0)
//         setSubjects([])
//       }
//     }

//     fetchStudyTime()
//   }, [selectedDate, type])

//   // 실제 공부 기록이 있는지 확인
//   const hasSubjectData = subjects.length > 0

//   // Recharts에 전달할 차트 데이터
//   const chartData = useMemo(() => {
//     // 공부 기록이 있으면 백엔드 데이터를 그대로 사용
//     if (hasSubjectData) {
//       return subjects
//     }

//     // 기록 없으면 비율 100인 빈 데이터 만들어서 표시
//     return [
//       {
//         studyTitle: "공부 기록 없음",
//         ratio: 100,
//         subjectColor: "#ece8f7"
//       }
//     ]
//   }, [subjects, hasSubjectData])

//   return (
//     <div style={{ width: '100%', padding: '20px', backgroundColor: '#fcfbf9', borderRadius: '20px' }}>

//       <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//         <h3 style={{ color: '#888', fontSize: '0.9rem' }}>과목별 공부시간</h3>
//         <h2 style={{ color: '#333', fontSize: '2rem', margin: '5px 0' }}>
//           {hour}시간 {min}분
//         </h2>
//       </div>

//       {/* Recharts 파이 차트 렌더링 영역 */}
//       <div
//         style={{
//           position: "relative",
//           width: "100%",
//           height: "200px"
//         }}
//       >
//         {/* 부모 크기에 맞춰 차트 크기 자동 조절 */}
//         <ResponsiveContainer
//           width="100%"
//           height="100%"
//         >
//           <PieChart>
//             <Pie
//               data={chartData}
//               dataKey="ratio"
//               nameKey="studyTitle"
//               cx="50%"
//               cy="50%"
//               innerRadius={60}
//               outerRadius={80}
//               stroke="none"
//               isAnimationActive={true}
//             >
//               {chartData.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={entry.subjectColor}
//                 />
//               ))}
//             </Pie>

//             {/* 실제 공부 기록이 있을 때만 Tooltip 표시 */}
//             {hasSubjectData && (
//               <Tooltip
//                 formatter={(value, name) => [
//                   `${value}%`,
//                   name
//                 ]}
//               />
//             )}
//           </PieChart>
//         </ResponsiveContainer>

//         {/* 공부 기록이 없을 때 도넛 차트 가운데 문구 표시 */}
//         {!hasSubjectData && (
//           <div
//             style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",

//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",

//               transform: "translate(-50%, -50%)",
//               textAlign: "center",
//               pointerEvents: "none"
//             }}
//           >
//             <span
//               style={{
//                 color: "#999",
//                 fontSize: "0.75rem"
//               }}
//             >
//               공부 기록
//             </span>

//             <strong
//               style={{
//                 marginTop: "2px",
//                 color: "#666",
//                 fontSize: "1rem"
//               }}
//             >
//               없음
//             </strong>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
