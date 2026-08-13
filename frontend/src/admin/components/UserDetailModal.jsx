import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
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

import AppModal from "../../components/common/AppModal.jsx";
import AppAlert from "../../components/common/AppAlert.jsx";
import styles from "./UserDetailModal.module.css";


const getCurrentWeekRange = () => {
    const today = dayjs()

    // day(): 일요일 0, 월요일 1, ... 토요일 6
    const daysFromMonday = (today.day() + 6) % 7

    const monday = today.subtract(daysFromMonday, "day").startOf("day")

    const sunday = monday.add(6, "day").endOf("day")

    return [monday.toDate(), sunday.toDate()]
}

export default function UserDetailModal({ user, onClose }) {
    const [type, setType] = useState("daily")
    const [isDownloading, setIsDownloading] = useState(false)
    const [dateRange, setDateRange] = useState(getCurrentWeekRange)
    const [startDate, endDate] = dateRange
    const [alertMessage, setAlertMessage] = useState("")

    const isValidRange = (targetType, start, end) => {
        if (!start || !end) return true

        const diffDays = dayjs(end).diff(dayjs(start), "day")
        const diffMonths = dayjs(end).diff(dayjs(start), "month", true)

        if (targetType === "daily" && diffDays > 14) {
            setAlertMessage("일간 조회는 최대 14일까지만 가능합니다.")
            return false;
        }
        if (targetType === "weekly" && diffMonths > 3) {
            setAlertMessage("주간 조회는 최대 3개월까지만 가능합니다.");
            return false;
        }
        return true;
    }

    const handleTypeChange = (newType) => {
        if (isValidRange(newType, startDate, endDate)) {
            setType(newType);
        }
    }

    const handleDateChange = (update) => {
        const [newStart, newEnd] = update
        if (isValidRange(type, newStart, newEnd)) {
            setDateRange(update)
        }
    }

    const handleExcelDownload = async () => {
        if (!startDate || !endDate) {
            setAlertMessage("조회 기간을 먼저 선택해주세요.")
            return
        }

        setIsDownloading(true);
        try {
            const [studyRes, subjectRes, todoRes] = await Promise.all([
                getStudyTrend(type, formattedStartDate, formattedEndDate, user._id),
                getSubjectRecord(type, formattedStartDate, formattedEndDate, user._id),
                getTodoTrend(type, formattedStartDate, formattedEndDate, user._id),
            ])

            const profileData = [
                {
                    이름: user.nickname || "이름없음",
                    이메일: user.email || "",
                    가입일: dayjs(user.createdAt).format("YYYY-MM-DD HH:mm"),
                    그룹명: user.group.groupName || "이름없음",
                },
            ]

            const studyData = (studyRes.data || []).map((item) => ({
                "기간(라벨)": item.label,
                "총 공부시간(분)": item.studyTime,
            }))

            const subjectData = (subjectRes.data || []).map((item) => ({
                과목명: item.subject,
                "공부시간(분)": item.studyTime,
                "비율(%)": item.ratio,
            }))

            const todoData = (todoRes.data || []).map((item) => ({
                "기간(라벨)": item.label,
                "달성률(%)": item.achievementRate,
                "완료한 할일(개)": item.completedCount,
                "전체 할일(개)": item.totalCount,
            }))

            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.json_to_sheet(profileData),
                "사용자프로필",
            )
            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.json_to_sheet(studyData),
                "총_공부시간_추이",
            )
            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.json_to_sheet(subjectData),
                "과목별_공부기록",
            )
            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.json_to_sheet(todoData),
                "Todo_달성률",
            )

            const typeLabel =
                type === "daily" ? "일간" : type === "weekly" ? "주간" : "월간"

            const currentTime = dayjs().format("YYYY-MM-DD_HH-mm-ss")

            const fileName = `${user.name || user.nickname}_상세리포트_${typeLabel}_${formattedStartDate}~${formattedEndDate}_${currentTime}.xlsx`

            XLSX.writeFile(workbook, fileName)

        } catch (error) {
            console.error("엑셀 데이터 추출 실패:", error)
            setAlertMessage("엑셀 데이터를 불러오는 중 오류가 발생했습니다.")

        } finally {
            setIsDownloading(false)
        }
    };

    if (!user) return null
    const formattedStartDate = startDate
        ? dayjs(startDate).format("YYYY-MM-DD")
        : ""
    const formattedEndDate = endDate ? dayjs(endDate).format("YYYY-MM-DD") : ""

    return (
        <>
            <AppModal
                open={true}
                type="large"
                title="회원 상세"
                description={`${user.nickname}님의 학습 현황을 기간별로 확인합니다.`}
                onClose={onClose}
                footer={
                    <div className={styles.userDetailFooter}>
                        <button
                            type="button"
                            className="app-btn-secondary"
                            onClick={onClose}
                        >
                            닫기
                        </button>
                        <button
                            type="button"
                            className="app-btn-primary"
                            onClick={handleExcelDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? "데이터 추출 중..." : "엑셀 다운로드"}
                        </button>
                    </div>
                }
            >
                <div className={styles.userDetailControls}>
                    <div className={styles.userDetailTabs}>
                        {["daily", "weekly", "monthly"].map((value) => (
                            <button
                                key={value}
                                type="button"
                                className={type === value ? styles.active : ""}
                                onClick={() => handleTypeChange(value)}
                            >
                                {value === "daily"
                                    ? "일간"
                                    : value === "weekly"
                                        ? "주간"
                                        : "월간"}
                            </button>
                        ))}
                    </div>

                    <div className={styles.userDetailDateField}>
                        <span>조회 기간</span>
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleDateChange}
                            locale={ko}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="기간을 선택하세요"
                            isClearable
                            className="app-input"
                            maxDate={getCurrentWeekRange()[1]}
                        />
                    </div>
                </div>

                <div className={styles.userDetailContent}>
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
            </AppModal>

            <AppAlert
                open={Boolean(alertMessage)}
                type="warning"
                title="확인해주세요."
                message={alertMessage}
                onConfirm={() => setAlertMessage("")}
                onClose={() => setAlertMessage("")}
            />
        </>
    )
}
