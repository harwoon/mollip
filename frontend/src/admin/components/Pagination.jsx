import styles from "./Pagination.module.css" 

// 페이지 번호 배열 생성 (예: [1, 2, 3, 4, "...", 22])
function getPageNumbers(current, total) {
    const delta = 2
    const range = []
    const withDots = []
    let last

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i)
        }
    }

    for (const i of range) {
        if (last) {
            if (i - last === 2) {
                withDots.push(last + 1)   // 바로 다음 숫자 하나 차이면 "..." 대신 숫자 표시
            } else if (i - last !== 1) {
                withDots.push("...")
            }
        }
        withDots.push(i)
        last = i
    }

    return withDots
}

export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null

    const pageNumbers = getPageNumbers(page, totalPages)

    return (
        <div className={styles.pagination}>
            <button
                className={styles.paginationArrow}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ‹
            </button>

            {pageNumbers.map((num, idx) =>
                num === "..." ? (
                    <span key={`dots-${idx}`} className={styles.paginationDots}>...</span>
                ) : (
                    <button
                        key={num}
                        className={num === page ? `${styles.paginationButton} ${styles.active}` : styles.paginationButton}
                        onClick={() => onPageChange(num)}
                    >
                        {num}
                    </button>
                )
            )}

            <button
                className={styles.paginationArrow}
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                ›
            </button>
        </div>
    )
}