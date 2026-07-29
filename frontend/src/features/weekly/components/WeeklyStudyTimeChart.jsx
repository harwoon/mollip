import React, { useEffect, useState } from "react";
import { getWeeklyStudyRecords } from "../api/weekly";
import dayjs from "dayjs";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function WeeklyStudyTimeChart({ selectedDate }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");

        const data = await getWeeklyStudyRecords(formattedDate);

        // 응답이 배열인지 확인
        const records = Array.isArray(data) ? data : data.records || [];

        const studyTimeByDate = records.reduce((result, record) => {
          const studyDate = record.studyDate;
          const studyTime = Number(record.sumStudyTime) || 0;

          result[studyDate] = (result[studyDate] || 0) + studyTime;

          return result;
        }, {});

        const selectedDay = dayjs(formattedDate);
        const dayNumber = selectedDay.day();

        const monday = selectedDay.subtract(
          dayNumber === 0 ? 6 : dayNumber - 1,
          "day",
        );

        // 월요일부터 일요일까지 차트 데이터 생성
        const formattedChartData = WEEK_DAYS.map((day, index) => {
          const date = monday.add(index, "day").format("YYYY-MM-DD");

          const rawMinutes = studyTimeByDate[date] || 0;

          return {
            name: day,
            date,
            hours: Number((rawMinutes / 60).toFixed(1)),
            rawMinutes,
          };
        });

        setChartData(formattedChartData);
      } catch (error) {
        console.error("주간 공부 시간을 가져오는데 실패했습니다:", error);

        setChartData([]);
      }
    };

    fetchData();
  }, [selectedDate]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, date, rawMinutes } = payload[0].payload;

      const hours = Math.floor(rawMinutes / 60);
      const minutes = rawMinutes % 60;

      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "12px",
            border: "none",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              margin: "0 0 5px 0",
              fontWeight: "bold",
              color: "#8a6bc7",
            }}
          >
            {name}요일
          </p>

          <p
            style={{
              margin: "0 0 5px 0",
              color: "#888",
              fontSize: "12px",
            }}
          >
            {dayjs(date).format("YYYY.MM.DD")}
          </p>

          <p
            style={{
              margin: 0,
              color: "#333",
            }}
          >
            {hours}시간 {minutes}분
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: "#fcfbf9",
        borderRadius: "20px",
      }}
    >
      <h3
        style={{
          color: "#333",
          fontSize: "1.2rem",
          marginBottom: "20px",
        }}
      >
        주간 총 공부 시간
      </h3>

      {chartData.length > 0 ? (
        <div
          style={{
            width: "100%",
            height: "250px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ddd"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#555",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#888",
                  fontSize: 12,
                }}
                tickFormatter={(value) => `${value}H`}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#d9d1ec",
                  strokeDasharray: "3 3",
                }}
              />

              <Line
                type="linear"
                dataKey="hours"
                stroke="#8a6bc7"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#8a6bc7",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p
          style={{
            textAlign: "center",
            color: "#aaa",
            marginTop: "40px",
          }}
        >
          공부 기록이 없습니다.
        </p>
      )}
    </div>
  );
}
