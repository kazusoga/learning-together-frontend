import axios from "axios";
import styles from "./styles.module.css";

export default async function LearningDetail({
  params,
}: {
  params: { id: string };
}) {
  const learning = await axios
    .get(`${process.env.NEXT_PUBLIC_API_BASE}/learnings/${params.id}`)
    .then((res) => {
      return res.data.learning;
    });

  return (
    <div className={styles.learningDetail}>
      <h1 className={styles.learningDetailTitle}>{learning.title}</h1>
      <div className={styles.learningDetailContent}>{learning.detail}</div>
    </div>
  );
}
