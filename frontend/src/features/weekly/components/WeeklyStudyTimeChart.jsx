import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import styles from "./WeeklyStudyTimeChart.module.css";


function formatStudyTime(hours) {
  const totalMinutes =
    Math.round(hours * 60);

  const hour =
    Math.floor(totalMinutes / 60);

  const minute =
    totalMinutes % 60;

  if (hour === 0) {
    return `${minute}분`;
  }

  if (minute === 0) {
    return `${hour}시간`;
  }

  return `${hour}시간 ${minute}분`;
}


export default function WeeklyStudyTimeChart({
  data = [],
}) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>
        주간 총 공부 시간
      </h3>

      {data.length === 0 ? (
        <p className={styles.emptyMessage}>
          주간 공부 기록이 없습니다.
        </p>
      ) : (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 15,
                bottom: 0,
                left: -15,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#d8d2e1"
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, "auto"]}
                tickFormatter={(value) =>
                  `${value}H`
                }
              />

              <Tooltip
                formatter={(value) => [
                  formatStudyTime(value),
                  "공부 시간",
                ]}
                labelFormatter={(
                  label,
                  payload,
                ) => {
                  const date =
                    payload?.[0]?.payload
                      ?.date;

                  return date
                    ? `${date} (${label})`
                    : `${label}요일`;
                }}
              />

              <Line
                type="monotone"
                dataKey="studyTime"
                stroke="#8058c7"
                strokeWidth={2}
                connectNulls
                dot={{
                  r: 3,
                  fill: "#8058c7",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}