import React, { useState, useEffect } from "react";
import { getLongestRecord } from "../api/study.js";
import dayjs from "dayjs";

import { FiZap } from "react-icons/fi";
import styles from "./LongestStudy.module.css";

export default function LongestStudy({ selectedDate, type }) {
  const [hour, setHour] = useState(0);
  const [min, setMin] = useState(0);

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");

        // API 요청
        const data = await getLongestRecord(type, formattedDate);

        const totalSeconds = data || 0;

        const totalMinutes = Math.floor(totalSeconds / 60);

        setHour(Math.floor(totalMinutes / 60));
        setMin(totalMinutes % 60);
      } catch (error) {
        console.error("집중 시간을 가져오는데 실패했습니다:", error);
      }
    };

    fetchStudyTime();
  }, [selectedDate, type]);

  return (
    <section className={`commonSection ${styles.container}`}>
      <div className={styles.header}>
        <span className={styles.iconBox}>
          <FiZap aria-hidden="true" />
        </span>

        <div>
          <h3 className={styles.title}>집중 시간</h3>
          <p className={styles.description}>가장 오래 집중한 학습시간</p>
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
