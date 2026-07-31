import "./Pagination.css"

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
        <div className="pagination">
            <button
                className="paginationArrow"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ‹
            </button>

            {pageNumbers.map((num, idx) =>
                num === "..." ? (
                    <span key={`dots-${idx}`} className="paginationDots">...</span>
                ) : (
                    <button
                        key={num}
                        className={num === page ? "paginationButton active" : "paginationButton"}
                        onClick={() => onPageChange(num)}
                    >
                        {num}
                    </button>
                )
            )}

            <button
                className="paginationArrow"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                ›
            </button>
        </div>
    )
}