import React, { useState } from "react";
import "./UserDetailModal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import {
  getStudyTrend,
  getSubjectRecord,
  getTodoTrend,
} from "../features/user/api/user.js";

import UserDetailInfo from "../features/user/components/UserDetailInfo";
import SubjectRecord from "../features/user/components/SubjectRecord";
import TotalStudy from "../features/user/components/TotalStudy";
import TodoRate from "../features/user/components/TodoRate";

const getCurrentWeekRange = () => {
  const today = dayjs();

  // day(): 일요일 0, 월요일 1, ... 토요일 6
  const daysFromMonday = (today.day() + 6) % 7;

  const monday = today.subtract(daysFromMonday, "day").startOf("day");

  const sunday = monday.add(6, "day").endOf("day");

  return [monday.toDate(), sunday.toDate()];
};

export default function UserDetailModal({ user, onClose }) {
  const [type, setType] = useState("daily");
  const [isDownloading, setIsDownloading] = useState(false);
  const [dateRange, setDateRange] = useState(getCurrentWeekRange);
  const [startDate, endDate] = dateRange;

  const isValidRange = (targetType, start, end) => {
    if (!start || !end) return true;

    const diffDays = dayjs(end).diff(dayjs(start), "day");
    const diffMonths = dayjs(end).diff(dayjs(start), "month", true);

    if (targetType === "daily" && diffDays > 14) {
      alert("일간 조회는 최대 14일까지만 가능합니다.");
      return false;
    }
    if (targetType === "weekly" && diffMonths > 3) {
      alert("주간 조회는 최대 3개월까지만 가능합니다.");
      return false;
    }

    return true;
  };

  const handleTypeChange = (newType) => {
    if (isValidRange(newType, startDate, endDate)) {
      setType(newType);
    }
  };

  const handleDateChange = (update) => {
    const [newStart, newEnd] = update;
    if (isValidRange(type, newStart, newEnd)) {
      setDateRange(update);
    }
  };

  const handleExcelDownload = async () => {
    if (!startDate || !endDate) {
      alert("조회 기간을 먼저 선택해주세요.");
      return;
    }

    setIsDownloading(true);
    try {
      const [studyRes, subjectRes, todoRes] = await Promise.all([
        getStudyTrend(type, formattedStartDate, formattedEndDate, user._id),
        getSubjectRecord(type, formattedStartDate, formattedEndDate, user._id),
        getTodoTrend(type, formattedStartDate, formattedEndDate, user._id),
      ]);

      const profileData = [
        {
          이름: user.nickname || "이름없음",
          이메일: user.email || "",
          가입일: dayjs(user.createdAt).format("YYYY-MM-DD HH:mm"),
          그룹명: user.group.groupName || "이름없음",
        },
      ];

      const studyData = (studyRes.data || []).map((item) => ({
        "기간(라벨)": item.label,
        "총 공부시간(분)": item.studyTime,
      }));

      const subjectData = (subjectRes.data || []).map((item) => ({
        과목명: item.subject,
        "공부시간(분)": item.studyTime,
        "비율(%)": item.ratio,
      }));

      const todoData = (todoRes.data || []).map((item) => ({
        "기간(라벨)": item.label,
        "달성률(%)": item.achievementRate,
        "완료한 할일(개)": item.completedCount,
        "전체 할일(개)": item.totalCount,
      }));

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(profileData),
        "유저프로필",
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(studyData),
        "총_공부시간_추이",
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(subjectData),
        "과목별_공부기록",
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(todoData),
        "Todo_달성률",
      );

      const typeLabel =
        type === "daily" ? "일간" : type === "weekly" ? "주간" : "월간";
      const currentTime = dayjs().format("YYYY-MM-DD_HH-mm-ss");
      const fileName = `${user.name || user.nickname}_상세리포트_${typeLabel}_${formattedStartDate}~${formattedEndDate}_${currentTime}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("엑셀 데이터 추출 실패:", error);
      alert("엑셀 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!user) return null;
  const formattedStartDate = startDate
    ? dayjs(startDate).format("YYYY-MM-DD")
    : "";
  const formattedEndDate = endDate ? dayjs(endDate).format("YYYY-MM-DD") : "";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "10px",
          width: "80%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          <h2 style={{ margin: 0 }}>회원 상세</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handleExcelDownload}
              disabled={isDownloading}
              style={{
                cursor: isDownloading ? "wait" : "pointer",
                padding: "5px 15px",
                backgroundColor: "#2E7D32",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              {isDownloading ? "데이터 추출 중..." : "엑셀 다운로드"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ cursor: "pointer", padding: "5px 10px" }}
            >
              ✕ 닫기
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "5px" }}>
            <button
              type="button"
              onClick={() => handleTypeChange("daily")}
              style={{ fontWeight: type === "daily" ? "bold" : "normal" }}
            >
              일간
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("weekly")}
              style={{ fontWeight: type === "weekly" ? "bold" : "normal" }}
            >
              주간
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("monthly")}
              style={{ fontWeight: type === "monthly" ? "bold" : "normal" }}
            >
              월간
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "14px", color: "#555" }}>
              조회 기간:
            </label>
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="기간을 선택하세요"
              isClearable={true}
              className="custom-datepicker"
              maxDate={getCurrentWeekRange()[1]}
            />
          </div>
        </div>

        <UserDetailInfo user={user} />

        <TotalStudy
          type={type}
          start={formattedStartDate}
          end={formattedEndDate}
          userId={user._id}
        />

        <TodoRate
          type={type}
          start={formattedStartDate}
          end={formattedEndDate}
          userId={user._id}
        />

        <SubjectRecord
          type={type}
          start={formattedStartDate}
          end={formattedEndDate}
          userId={user._id}
        />
      </div>
    </div>
  );
}
