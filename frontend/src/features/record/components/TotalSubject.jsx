import React, { useState, useEffect, useMemo } from "react";
import { getSubjectRecord } from "../api/study.js";
import { getSubjectStudySummary } from "../api/study.js";
import dayjs from "dayjs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import styles from "./TotalSubject.module.css";

function formatStudyTime(seconds) {
  const safeSeconds =
    Number(seconds) || 0

  const totalMinutes =
    Math.floor(safeSeconds / 60)

  const hours =
    Math.floor(totalMinutes / 60)

  const minutes =
    totalMinutes % 60

  return `${hours}시간 ${minutes}분`
}

function getComparisonText(
  type,
  comparison,
) {
  if (!comparison) {
    return ""
  }

  const previousPeriodMap = {
    daily: "어제",
    weekly: "지난주",
    monthly: "지난달",
  }

  const previousPeriod =
    previousPeriodMap[type] ||
    "이전 기간"

  const {
    currentSubject,
    previousSubject,
    difference,
    status,
  } = comparison

  if (status === "same") {
    return (
      `${currentSubject}을 가장 많이 공부했고, ` +
      `${previousPeriod}의 ${previousSubject}과 ` +
      `같은 비율로 공부했어요`
    )
  }

  if (status === "up") {
    return (
      `${currentSubject}을 가장 많이 공부했고, ` +
      `${previousPeriod}의 ${previousSubject}보다 ` +
      `${difference}% 높게 공부했어요 ▲`
    )
  }

  return (
    `${currentSubject}을 가장 많이 공부했고, ` +
    `${previousPeriod}의 ${previousSubject}보다 ` +
    `${difference}% 낮게 공부했어요 ▼`
  )
}

function SubjectTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null
  }

  const subject =
    payload[0].payload

  return (
    <div className={styles.tooltip}>
      <strong>
        {subject.studyTitle}
      </strong>

      <span>
        {formatStudyTime(
          subject.sumStudyTime,
        )}
      </span>

      <span>
        {subject.ratio}%
      </span>
    </div>
  )
}

export default function TotalSubject({
  selectedDate,
  type,
}) {
  const [summary, setSummary] =
    useState({
      totalStudyTime: 0,
      comparison: {
        status: "same",
        rate: 0,
      },
      subjects: [],
    })

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  useEffect(() => {
    let cancelled = false

    async function fetchSummary() {
      try {
        setLoading(true)
        setError("")

        const formattedDate =
          dayjs(selectedDate)
            .format("YYYY-MM-DD")

        const data =
          await getSubjectStudySummary(
            type,
            formattedDate,
          )

        if (!cancelled) {
          setSummary(data)
        }
      } catch (error) {
        console.error(
          "과목별 공부시간 조회 실패:",
          error,
        )

        if (!cancelled) {
          setError(error.message)

          setSummary({
            totalStudyTime: 0,
            comparison: {
              status: "same",
              rate: 0,
            },
            subjects: [],
          })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchSummary()

    return () => {
      cancelled = true
    }
  }, [
    selectedDate,
    type,
  ])

  const hasData =
    summary.subjects.length > 0

  const chartData =
    useMemo(() => {
      if (hasData) {
        return summary.subjects
      }

      return [
        {
          studyTitle:
            "공부 기록 없음",
          sumStudyTime: 1,
          ratio: 0,
          subjectColor:
            "#E4DCEF",
        },
      ]
    }, [
      summary.subjects,
      hasData,
    ])

  const comparisonClassName = [
    styles.comparison,
    styles[
    summary.comparison.status
    ],
  ].join(" ")

  return (
    <section
      className={`commonSection ${styles.container}`}
    >
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>
            과목별 공부시간
          </h3>

          {loading && (
            <p className={styles.description}>
              공부시간을 불러오는 중입니다.
            </p>
          )}

          {error && (
            <p className={styles.description}>
              과목별 공부시간을 불러오지 못했습니다.
            </p>
          )}
        </div>

        <strong className={styles.totalTime}>
          {loading
            ? "-"
            : formatStudyTime(
              summary.totalStudyTime,
            )}
        </strong>
      </div>

      <div className={styles.chartArea}>
        {!loading && !error && hasData ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="sumStudyTime"
                nameKey="studyTitle"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="82%"
                stroke="none"
                isAnimationActive
              >
                {chartData.map(
                  (subject, index) => (
                    <Cell
                      key={
                        `${subject.studyTitle}-${index}`
                      }
                      fill={
                        subject.subjectColor
                      }
                    />
                  ),
                )}
              </Pie>

              <Tooltip
                content={<SubjectTooltip />}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          !loading && (
            <div className={styles.emptyState}>
              <span>
                {error
                  ? "조회 실패"
                  : "공부 기록이 없습니다."}
              </span>

              <strong>
                {error
                  ? "잠시 후 다시 시도해주세요."
                  : "공부를 시작해보세요!"}
              </strong>
            </div>
          )
        )}
      </div>

      {/* 차트 아래 비교 문구 */}
      {!loading &&
        !error &&
        hasData &&
        summary.topSubjectComparison && (
          <p className={styles.description}>
            {getComparisonText(
              type,
              summary.topSubjectComparison,
            )}
          </p>
        )}

      {!loading &&
        !error &&
        hasData &&
        !summary.topSubjectComparison && (
          <p className={styles.description}>
            비교할 이전 공부 기록이 없습니다.
          </p>
        )}
    </section>
  )
}