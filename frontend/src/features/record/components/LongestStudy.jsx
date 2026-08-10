import { useState, useEffect } from "react";
import { getLongestRecord } from "../api/study.js";
import dayjs from "dayjs";

import { FiArrowDownRight, FiArrowUpRight, FiMinus, FiZap } from "react-icons/fi"
import styles from "./LongestStudy.module.css"

export default function LongestStudy({ selectedDate, type }) {
  const [hour, setHour] = useState(0)
  const [min, setMin] = useState(0)
  
  const [comparison, setComparison] = useState({
      status: "same",
      text: "이전 기간과 집중시간이 같아요.",
  })

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        // 1. 현재 선택된 날짜 데이터 가져오기
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
        const currentData = await getLongestRecord(type, formattedDate);
        const currentSeconds = currentData || 0;
        const currentMinutes = Math.floor(currentSeconds / 60);

        setHour(Math.floor(currentMinutes / 60));
        setMin(currentMinutes % 60);

        // 2. 비교할 '이전 날짜' 계산하기
        let prevDate = dayjs(selectedDate);
        let targetText = "이전";

        if (type === "일간" || type === "daily" || type === "day") {
          prevDate = prevDate.subtract(1, "day");
          targetText = "어제";
        } else if (type === "주간" || type === "weekly" || type === "week") {
          prevDate = prevDate.subtract(1, "week");
          targetText = "저번 주";
        } else if (type === "월간" || type === "monthly" || type === "month") {
          prevDate = prevDate.subtract(1, "month");
          targetText = "저번 달";
        }

        // 3. 이전 날짜로 과거 데이터 가져오기
        const prevFormattedDate = prevDate.format("YYYY-MM-DD");
        const prevData = await getLongestRecord(type, prevFormattedDate);
        const prevSeconds = prevData || 0;
        const prevMinutes = Math.floor(prevSeconds / 60);

        // 4. 차이 계산하기 (현재 분 - 과거 분)
        const diffMinutes = currentMinutes - prevMinutes;
        const absDiff = Math.abs(diffMinutes); 

        // 시간/분 포맷 만들기
        let diffString = "";
        if (absDiff >= 60) {
          const h = Math.floor(absDiff / 60);
          const m = absDiff % 60;
          diffString = m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
        } else {
          diffString = `${String(absDiff).padStart(2, '0')}분`; 
        }

        // 비교 텍스트 저장
        if (diffMinutes > 0) {
            setComparison({
                status: "up",
                text: `${targetText}보다 ${diffString} 더 오래 집중했어요.`,
            })
        } else if (diffMinutes < 0) {
            setComparison({
                status: "down",
                text: `${targetText}보다 ${diffString} 덜 집중했어요.`,
            })
        } else {
            setComparison({
                status: "same",
                text: `${targetText}와 집중시간이 같아요.`,
            })
        }

      } catch (error) {
        console.error("집중 시간을 가져오는데 실패했습니다:", error)
      }
    }

    fetchStudyTime()
  }, [selectedDate, type])


  return (
    <section className={`commonSection ${styles.container}`}>
      <div className={styles.header}>
        <span className={styles.iconBox}>
          <FiZap aria-hidden="true" />
        </span>

        <div>
          <h3 className={styles.title}>집중 시간</h3>
          <p className={styles.description}>가장 오래 집중한 공부시간</p>
        </div>
      </div>

      <div className={styles.content}>
        <strong className={styles.time}>
          {String(hour).padStart(2, "0")}
          <span>시간</span> {String(min).padStart(2, "0")}
          <span>분</span>
        </strong>
      </div>

      <div className={`app-trend app-trend--${comparison.status}`}>
        <span className="app-trend-icon" aria-hidden="true">
          {comparison.status === "same"
            ? <FiMinus />
            : comparison.status === "down"
              ? <FiArrowDownRight />
              : <FiArrowUpRight />}
        </span>
        <span>{comparison.text}</span>
      </div>
    </section>
  )
}