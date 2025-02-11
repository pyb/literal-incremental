import styles from "./page.module.css";
import GameMain from "./Main";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <GameMain />
      </main>
    </div>
  );
}
