import SubjectInfo from "../features/mypage/components/SubjectInfo";
import UserInfo from "../features/mypage/components/UserInfo";

import styles from "./MyPage.module.css";

export default function MyPage() {
    return (
        <main className="app-page app-page--fixed">
            <div
                className={`app-page__inner ${styles.page}`}
            >
                <div className={styles.userArea}>
                    <UserInfo />
                </div>

                <div className={styles.subjectArea}>
                    <SubjectInfo />
                </div>
            </div>
        </main>
    );
}
