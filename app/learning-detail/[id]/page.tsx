'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";

type Learning = {
  id: number;
  title: string;
  detail: string;
  helping: boolean;
};

export default function LearningDetail({ params }: { params: { id: string } }) {
  const [learning, setLearning] = useState<Learning>({
    id: 0,
    title: "",
    detail: "",
    helping: false,
  });

  const fetchLearning = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE}/learnings/${params.id}`
    );
    setLearning(res.data.learning);
  };
  useEffect(() => {
    fetchLearning()
  }, []);

  return (
    <div className={styles.learningDetail}>
      <h1 className={styles.learningDetailTitle}>{learning.title}</h1>
      <div className={styles.learningDetailContent}>
        {learning.detail}
      </div>
    </div>
  );
}
