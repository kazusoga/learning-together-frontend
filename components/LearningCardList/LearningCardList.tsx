import styles from "./styles.module.css";
import axios from "axios";
import Link from "next/link";

type Learning = {
  id: number;
  title: string;
  detail: string;
  helping: boolean;
};

const LearningCardList = async () => {
  const learnings: Learning[] = await axios
    .get(`${process.env.NEXT_PUBLIC_API_BASE}/learnings`)
    .then((res) => {
      return res.data.learnings;
    });

  return (
    <div className={styles.learningCardList}>
      {learnings.map((learning: Learning) => {
        return (
          <Link
            className={styles.learningCard}
            key={learning.id}
            href={`/learnings/${learning.id}`}
          >
            <div className={styles.learningCard__title}>{learning.title}</div>
            <div className={styles.learningCard__detail}>{learning.detail}</div>
          </Link>
        );
      })}
    </div>
  );
};

export default LearningCardList;
