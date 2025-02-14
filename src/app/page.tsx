import styles from "./page.module.css";
import GameMain from "UI/Main";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <GameMain />
      </main>
    </div>
  );
}
