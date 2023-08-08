"use client";

import styles from "./styles.module.css";

import { useState } from "react";

const Tabs = ({
  tabs,
  children,
}: {
  tabs: string[];
  children: React.ReactNode;
}) => {
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
      {children}
    </div>
  );
};

export default Tabs;
