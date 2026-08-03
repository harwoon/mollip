import LoginForm from "../features/auth/components/LoginForm"

import styles from "./LoginPage.module.css"

export default function LoginPage() {
    return (
        <main className={styles.loginPage}>
            <section className={styles.loginCard}>
                <header className={styles.loginHeader}>
                    <img
                        className={styles.logo}
                        src="/images/logo.png"
                        alt="Mollip"
                    />

                    <h1 className={styles.title}>
                        안녕하세요, 몰입입니다.
                    </h1>

                    <p className={styles.description}>
                        서비스 이용을 위해 로그인해 주세요.
                    </p>
                </header>

                <LoginForm />
            </section>
        </main>
    )
}