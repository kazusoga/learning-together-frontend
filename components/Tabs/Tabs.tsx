"use client";

import styles from "./styles.module.css";

import { useState } from "react";

type TabProps = {
  tabs: string[];
};

const Tabs = ({ tabs }: TabProps) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

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
        <div className={styles.learningCard}>
          <div className={styles.learningCard__title}>電磁気学</div>
          <div className={styles.learningCard__description}>
            アンペール・マクスウェルの法則の導出をやっています
          </div>
        </div>
        <div className={styles.learningCard}>
          <div className={styles.learningCard__title}>熱力学</div>
          <div className={styles.learningCard__description}>
            熱力学的極限について勉強中
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
