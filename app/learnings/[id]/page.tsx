import axios from "axios";
import styles from "./styles.module.css";
import Link from "next/link";
import HelpButton from "../../../components/HelpButton/HelpButton";

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
      <Link
        href={`/learnings/${params.id}/whiteboard`}
        className={styles.openWhiteboardButton}
      >
        ホワイトボードを開く
      </Link>
      <HelpButton learningId={params.id} />
    </div>
  );
}
