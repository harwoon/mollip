import SignupForm from "../features/auth/components/SignupForm"

import styles from "./SignupPage.module.css"

export default function SignupPage() {
    return (
        <main className={styles.signupPage}>
            <section className={styles.signupCard}>
                <header className={styles.signupHeader}>
                    <img
                        className={styles.logo}
                        src="/images/logo.png"
                        alt="Mollip"
                    />

                    <h1 className={styles.title}>
                        안녕하세요, 몰입입니다.
                    </h1>

                    <p className={styles.description}>
                        서비스 이용을 위해 회원가입해 주세요.
                    </p>
                </header>

                <SignupForm />
            </section>
        </main>
    )
}