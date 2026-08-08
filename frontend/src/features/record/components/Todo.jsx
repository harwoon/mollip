import { useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { getTodoRecords } from "../api/todo"
import styles from "./Todo.module.css"
import { RiFlagLine } from "react-icons/ri"


export default function Todo({
    selectedDate, type
}) {
    // Todo 목록 필터 : 전체. 완료. 미완료
    const [filter, setFilter] = useState("all")

    // API에서 조회한 Todo 목록
    const [todoList, setTodoList] = useState([])

    // API 요청 상태
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // 조회 단위, 날짜 바뀔때마다 Todo 기록 다시 조회
    useEffect(() => {
        async function fetchTodoRecords() {
            try {
                setLoading(true)
                setError("")

                // YYYY-MM-DD 문자열로 변환
                const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD")

                // 선택된 조회 단위, 날짜 전달
                const data = await getTodoRecords(
                    type,
                    formattedDate
                )

                // 백엔드에서 받은 TodoList 문서 화면 보여줄 Todo배열로 반환
                const normalizedTodoList = normalizeTodoRecords(data)

                setTodoList(normalizedTodoList)

            } catch (error) {
                console.error("Todo 기록 조회 오류:", error)

                setError(
                    error.message ||
                    "Todo 기록을 불러오지 못했습니다."
                )

                setTodoList([])
            } finally {
                setLoading(false)
            }
        }

        fetchTodoRecords()
    }, [type, selectedDate])


    // 조회 단위, 날짜 변경되면 필터 전체로 초기화
    useEffect(() => {
        setFilter("all")
    }, [type, selectedDate])


    // 완료된 Todo개수
    const completedCount = useMemo(() => {
        return todoList.filter(
            (todoItem) => todoItem.state === true
        ).length
    }, [todoList])


    // 미완료 Todo개수
    const incompleteCount = todoList.length - completedCount


    // 목표 달성률 계산
    // 완료 / 전체 x 100 (없으면 0%)
    const achievementRate = useMemo(() => {
        if (todoList.length === 0) {
            return 0
        }

        return Math.round(
            (completedCount / todoList.length) * 100
        )
    }, [todoList.length, completedCount])


    // Recharts 도넛 차트 데이터
    const chartData = useMemo(() => {
        // todo 한개도 없으면 완료, 미완료 모두 0임
        // 회색 도넛 만들고 달성률 0%로 표시
        if (todoList.length === 0) {
            return [
                {
                    name: "Todo 없음",
                    value: 1,
                    color: "#dddddd"
                }
            ]
        }

        return [
            {
                name: "완료",
                value: completedCount,
                color: "#7654bd"
            },
            {
                name: "미완료",
                value: incompleteCount,
                color: "#ebe7f3"
            }
        ]
    }, [
        todoList.length,
        completedCount,
        incompleteCount
    ])


    // 선택된 필터에 맞는 Todo만 반환
    const filteredTodoList = useMemo(() => {
        // 완료 목록
        if (filter === "completed") {
            return todoList.filter(
                (todoItem) => todoItem.state === true
            )
        }
        // 미완료 목록
        if (filter === "incomplete") {
            return todoList.filter(
                (todoItem) => todoItem.state === false
            )
        }
        // 전체 목록
        return todoList
    }, [todoList, filter])


    return (
        <section className={styles.todoRecord}>
            {/* 목표 달성률 영역 */}
            <div className={styles.achievementCard}>
                <div className={styles.achievementHeader}>
                    <div className={styles.achievementHeaderIcon}>
                        <RiFlagLine size={24} />
                    </div>

                    <h2 className={styles.achievementTitle}>
                        목표 달성률
                    </h2>
                </div>

                {/* Recharts 도넛 차트 */}
                <div className={styles.chartArea}>
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={58}
                                outerRadius={78}
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={0}
                                stroke="none"
                                isAnimationActive={true}
                            >
                                {chartData.map((chartItem) => (
                                    <Cell
                                        key={chartItem.name}
                                        fill={chartItem.color}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* 도넛 차트 가운데 달성률 */}
                    <div className={styles.chartCenter}>
                        <span className={styles.achievementLabel}>
                            목표 달성률
                        </span>

                        <strong className={styles.achievementRate}>
                            {achievementRate}%
                        </strong>
                    </div>
                </div>

                {/* 완료 / 미완료 개수 */}
                <div className={styles.achievementSummary}>
                    <div className={styles.achievementSummaryItem}>
                        <span
                            className={`
                                ${styles.summaryDot}
                                ${styles.completedDot}
                            `}
                        />

                        <span>
                            완료 {completedCount}개
                        </span>
                    </div>

                    <div className={styles.achievementSummaryItem}>
                        <span
                            className={`
                                ${styles.summaryDot}
                                ${styles.incompleteDot}
                            `}
                        />

                        <span>
                            미완료 {incompleteCount}개
                        </span>
                    </div>
                </div>
            </div>


            {/* Todo 기록 목록 영역 */}
            <div className={styles.pastListCard}>
                <div className={styles.pastListHeader}>
                    <h2 className={styles.pastListTitle}>
                        Past List
                    </h2>

                    {/* 전체 / 완료 / 미완료 필터 */}
                    <div className={styles.todoFilter}>
                        <button
                            type="button"
                            className={
                                filter === "all"
                                    ? `${styles.todoFilterButton} ${styles.active}`
                                    : styles.todoFilterButton
                            }
                            onClick={() => setFilter("all")}
                        >
                            전체
                            <span>{todoList.length}</span>
                        </button>

                        <button
                            type="button"
                            className={
                                filter === "completed"
                                    ? `${styles.todoFilterButton} ${styles.active}`
                                    : styles.todoFilterButton
                            }
                            onClick={() =>
                                setFilter("completed")
                            }
                        >
                            완료
                            <span>{completedCount}</span>
                        </button>

                        <button
                            type="button"
                            className={
                                filter === "incomplete"
                                    ? `${styles.todoFilterButton} ${styles.active}`
                                    : styles.todoFilterButton
                            }
                            onClick={() =>
                                setFilter("incomplete")
                            }
                        >
                            미완료
                            <span>{incompleteCount}</span>
                        </button>
                    </div>
                </div>


                {/* API 요청 중 */}
                {loading && (
                    <p className={styles.todoRecordMessage}>
                        Todo 기록을 불러오는 중입니다.
                    </p>
                )}


                {/* API 요청 실패 */}
                {!loading && error && (
                    <p
                        className={`
                            ${styles.todoRecordMessage}
                            ${styles.errorMessage}
                        `}
                    >
                        {error}
                    </p>
                )}


                {/* 조회 결과 없음 */}
                {!loading &&
                    !error &&
                    filteredTodoList.length === 0 && (
                        <p className={styles.todoRecordMessage}>
                            해당 기간에 등록된 Todo가 없습니다.
                        </p>
                    )}


                {/* Todo 목록 */}
                {!loading &&
                    !error &&
                    filteredTodoList.length > 0 && (
                        <ul className={styles.pastTodoList}>
                            {filteredTodoList.map(
                                (todoItem) => (
                                    <li
                                        key={
                                            `${todoItem.todoDate}-${todoItem._id}`
                                        }
                                        className={
                                            todoItem.state
                                                ? `${styles.pastTodoItem} ${styles.completedItem}`
                                                : `${styles.pastTodoItem} ${styles.incompleteItem}`
                                        }
                                    >
                                        {/* 완료 여부 아이콘 */}
                                        <span
                                            className={
                                                styles.pastTodoState
                                            }
                                        >
                                            {todoItem.state
                                                ? "✓"
                                                : "×"}
                                        </span>

                                        {/* Todo 내용 */}
                                        <span
                                            className={
                                                styles.pastTodoText
                                            }
                                        >
                                            {todoItem.todo}
                                        </span>

                                        {/* TodoList가 가진 날짜 */}
                                        <time
                                            className={
                                                styles.pastTodoDate
                                            }
                                            dateTime={
                                                todoItem.todoDate
                                            }
                                        >
                                            {dayjs(
                                                todoItem.todoDate
                                            ).format("YY.MM.DD")}
                                        </time>
                                    </li>
                                )
                            )}
                        </ul>
                    )}
            </div>
        </section>
    )
}


// Todo 항목 자체엔 날짜 없어서 TodoList에 todoDate 가져옴
function normalizeTodoRecords(data) {
    // 응답 데이터가 없으면 빈 배열 반환
    if (!data) {
        return []
    }

    // 일간 조회 결과가 TodoList 객체 하나인 경우
    if (
        !Array.isArray(data) &&
        Array.isArray(data.todo)
    ) {
        return data.todo.map((todoItem) => ({
            ...todoItem,
            todoDate: data.todoDate
        }))
    }

    // 주간·월간 조회 결과가 배열인 경우에는 그대로
    const todoListDocuments = Array.isArray(data)
        ? data
        : data.records ?? []

    // 여러 날짜의 TodoList 문서 안에 있는 Todo를 하나의 배열로 합침
    return todoListDocuments.flatMap(
        (todoListDocument) => {
            // todo 배열이 없는 잘못된 데이터는 제외
            if (!Array.isArray(todoListDocument.todo)) {
                return []
            }

            return todoListDocument.todo.map(
                (todoItem) => ({
                    ...todoItem,

                    // 부모 TodoList 날짜 추가
                    todoDate:
                        todoListDocument.todoDate
                })
            )
        }
    )
}