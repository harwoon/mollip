import styles from "./AdminTopbar.module.css"

export default function AdminSidebar({ title, description, children}) {

    return (
        <header className={styles.adminTopbar}>
            <div className={styles.adminTopbarText}>
                <h1 className="app-page-title">{title}</h1>
                <p className="app-page-description">{description}</p>
            </div>

            {children && (
                <div className={styles.adminTopbarControls}>
                    {children}
                </div>
            )}
        </header>
    )
}