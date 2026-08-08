import React, { useState, useEffect } from "react";
import { getStudyRecord } from "../api/study.js";
import dayjs from "dayjs";

import { FiClock } from "react-icons/fi";
import styles from "./TotalStudy.module.css";

export default function TotalStudy({ selectedDate, type }) {
  const [hour, setHour] = useState(0);
  const [min, setMin] = useState(0);

  const [diffHour, setDiffHour] = useState(0)
  const [diffMin, setDiffMin] = useState(0)

  const [isDecrease, setIsDecrease] = useState(false)
  const [isSame, setIsSame] = useState(true)

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");

        // API 요청
        const data = await getStudyRecord(type, formattedDate);

        const totalSeconds = data.current || 0
        const diff = data.diff

        const absDiff = Math.abs(diff)

        setHour(Math.floor(totalSeconds / 3600));
        setMin(Math.floor((totalSeconds % 3600) / 60));

        setDiffHour(Math.floor(diff / 3600))
        setDiffMin(Math.floor((diff % 3600) / 60))

        setIsDecrease(data.diff < 0)
        setIsSame(diff === 0)

      } catch (error) {
        console.error("공부 시간을 가져오는데 실패했습니다:", error);
      }
    };

    fetchStudyTime();
  }, [selectedDate, type]);

  const compareText = type === "daily" ? "어제" : type === "weekly" ? "저번 주" : "저번 달"

  return (
    <section className={`commonSection ${styles.container}`}>
      <div className={styles.header}>
        <span className={styles.iconBox}>
          <FiClock aria-hidden="true" />
        </span>

        <div>
          <h3 className={styles.title}>총 공부시간</h3>

          <p className={styles.description}>선택한 기간의 누적 공부시간</p>
        </div>
      </div>

      <div>
        <span>{compareText}보다 </span>

        {diffHour > 0 && (
          <span>{String(diffHour).padStart(2, "0")}시간 </span>
        )}
        <span>{String(diffMin).padStart(2, "0")}분 </span>

        {isSame ? (
          <span>-</span>
        ) : isDecrease ? (
          <span>▼</span>
        ) : (
          <span>▲</span>
        )}
      </div>

      <div className={styles.content}>
        <strong className={styles.time}>
          {String(hour).padStart(2, "0")}
          <span>시간</span> {String(min).padStart(2, "0")}
          <span>분</span>
        </strong>
      </div>
    </section>
  );
}
