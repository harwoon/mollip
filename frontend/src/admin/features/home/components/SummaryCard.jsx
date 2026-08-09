import styles from "./SummaryCard.module.css"

export default function SummaryCard({ icon, label, value, unit, diff }) {
    return (
        <article className={`commonSection ${styles.summaryCard}`}>
            <div className={styles.summaryCardIcon} aria-hidden="true">
                {icon}
            </div>

            <div className={styles.summaryCardContent}>
                <p className={styles.summaryCardLabel}>{label}</p>
                <p className={styles.summaryCardValue}>
                    {value}<span className={styles.summaryCardUnit}>{unit}</span>
                </p>
                {diff && <p className={styles.summaryCardDiff}>{diff}</p>}
            </div>
        </article>
    )
}
