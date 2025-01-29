import styles from "./page.module.css";
import GameArea from "./GameArea";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <GameArea />
      </main>
    </div>
  );
}
