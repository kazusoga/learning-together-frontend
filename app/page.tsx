import styles from "./styles.module.css";
import Tabs from "../components/Tabs/Tabs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className={styles.header}>
        <div>Learning Together</div>
        <div className={styles.userIcon}></div>
      </div>
      <Tabs tabs={["勉強中", "フォロー中", "おすすめ"]} />
    </main>
  );
}
