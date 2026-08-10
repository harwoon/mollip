import styles from "./TabSelector.module.css";

export default function TabSelector({ currentType, onChangeType }) {
  return (
    <div className={styles.tabSelector}>
      <button type="button" className={
        currentType === "daily"
          ? `${styles.tabButton} ${styles.active}`
          : styles.tabButton}
        onClick={() => onChangeType("daily")}
      >
        일간
      </button>

      <button type="button" className={
        currentType === "weekly"
          ? `${styles.tabButton} ${styles.active}`
          : styles.tabButton}
        onClick={() => onChangeType("weekly")}
      >
        주간
      </button>

      <button type="button" className={
        currentType === "monthly"
          ? `${styles.tabButton} ${styles.active}`
          : styles.tabButton}
        onClick={() => onChangeType("monthly")}
      >
        월간
      </button>
    </div>
  )
}