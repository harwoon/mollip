import React, { useEffect, useState } from "react";
import { getGroupStreak } from "../api/weekly.js";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function GroupStreakChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const data = await getGroupStreak();

        setChartData([
          {
            name: "개인 공부 일수",
            days: Number(data.userStreak) || 0,
            color: "#6f52aa",
          },
          {
            name: "그룹 공부 일수",
            days: Number(data.groupStreak) || 0,
            color: "#e8c5e8",
          },
        ]);
      } catch (error) {
        console.error("연속 공부 달성 일수 조회 실패:", error);

        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const maxStreak = Math.max(...chartData.map((item) => item.days), 0);

  // 기본 최대 30일, 30일을 넘으면 5일 단위로 증가
  const xAxisMax = Math.max(30, Math.ceil(maxStreak / 5) * 5);

  const ticks = Array.from(
    { length: xAxisMax / 5 + 1 },
    (_, index) => index * 5,
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const { name, days, color } = payload[0].payload;

    return (
      <div
        style={{
          padding: "12px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <p
          style={{
            margin: "0 0 5px",
            fontWeight: "bold",
            color,
          }}
        >
          {name}
        </p>

        <p
          style={{
            margin: 0,
            color: "#333",
          }}
        >
          {days}일
        </p>
      </div>
    );
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
          margin: "0 0 12px",
          color: "#222",
          fontSize: "1.2rem",
        }}
      >
        연속 공부 달성 일수
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "15px",
        }}
      >
        {chartData.map((item) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />

            <span
              style={{
                color: "#444",
                fontSize: "12px",
              }}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {loading ? (
        <p
          style={{
            margin: "50px 0",
            textAlign: "center",
            color: "#aaa",
          }}
        >
          불러오는 중입니다.
        </p>
      ) : chartData.length > 0 ? (
        <div
          style={{
            width: "100%",
            height: "210px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 20,
                right: 20,
                left: 25,
                bottom: 10,
              }}
              barCategoryGap={4}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                vertical={false}
                stroke="#bbb"
              />

              <XAxis
                type="number"
                domain={[0, xAxisMax]}
                ticks={ticks}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#222",
                  fontSize: 11,
                  fontWeight: 600,
                }}
                tickFormatter={(value) => (value === 0 ? "일자" : `${value}일`)}
              />

              <YAxis type="category" dataKey="name" hide />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "#f4f0fa",
                }}
              />

              <Bar dataKey="days" barSize={30} radius={[2, 2, 2, 2]}>
                {chartData.map((item, index) => (
                  <Cell key={`cell-${index}`} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p
          style={{
            margin: "50px 0",
            textAlign: "center",
            color: "#aaa",
          }}
        >
          연속 공부 기록이 없습니다.
        </p>
      )}
    </div>
  );
}
