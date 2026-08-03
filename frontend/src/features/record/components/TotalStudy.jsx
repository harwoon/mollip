import React, { useState, useEffect } from "react";
import { getStudyRecord } from "../api/study.js";
import dayjs from "dayjs";

import { FiClock } from "react-icons/fi";
import styles from "./TotalStudy.module.css";

export default function TotalStudy({ selectedDate, type }) {
  const [hour, setHour] = useState(0);
  const [min, setMin] = useState(0);

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");

        // API 요청
        const data = await getStudyRecord(type, formattedDate);

        const totalMinutes = data || 0;

        setHour(Math.floor(totalMinutes / 3600));
        setMin(Math.floor((totalMinutes % 3600) / 60));
      } catch (error) {
        console.error("공부 시간을 가져오는데 실패했습니다:", error);
      }
    };

    fetchStudyTime();
  }, [selectedDate, type]);

  return (
    <section className={`commonSection ${styles.container}`}>
      <div className={styles.header}>
        <span className={styles.iconBox}>
          <FiClock aria-hidden="true" />
        </span>

        <div>
          <h3 className={styles.title}>총 공부시간</h3>

          <p className={styles.description}>선택한 기간의 누적 학습시간</p>
        </div>
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
