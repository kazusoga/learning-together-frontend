import styles from "./styles.module.css";
import Tabs from "../components/Tabs/Tabs";
import LearningCardList from "../components/LearningCardList/LearningCardList";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Tabs tabs={["勉強中", "フォロー中", "おすすめ"]}>
        <LearningCardList />
      </Tabs>
      <Link className={styles.startLearnButton} href="/start-learn">
        勉強開始!
      </Link>
    </main>
  );
}
