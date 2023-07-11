"use client";

import styles from "./styles.module.css";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type TabProps = {
  tabs: string[];
};

type Learning = {
  id: number;
  title: string;
  detail: string;
  helping: boolean;
};

const Tabs = ({ tabs }: TabProps) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // API からデータを取得する
  const [learnings, setLearnings] = useState([]);
  const fetchLearnings = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE}/learnings`
    );
    setLearnings(res.data);
  };

  useEffect(() => {
    fetchLearnings();
  });

  return (
    <div className="w-full">
      <div className={styles.tabs}>
        {tabs.map((tab) => {
          const tabColorClass =
            activeTab === tab ? styles.active : styles.inactive;
          return (
            <button
              className={`${styles.tab} ${tabColorClass}`}
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div className={styles.learningCardList}>
        {learnings.map((learning: Learning) => {
          return (
            <Link
              className={styles.learningCard}
              key={learning.id}
              href={`/learning-detail/${learning.id}`}
            >
              <div className={styles.learningCard__title}>{learning.title}</div>
              <div className={styles.learningCard__detail}>
                {learning.detail}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
