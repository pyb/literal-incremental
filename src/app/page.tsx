import styles from "./page.module.css";
import Game from "./Game";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Game />
      </main>
    </div>
  );
}
