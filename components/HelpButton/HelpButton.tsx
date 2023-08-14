// 「ヘルプoff」ボタンを作成する。
// クリックすると、ヘルプonになる。
"use client";
import styles from "./styles.module.css";
import { useState } from "react";
import customAxios from "@/modules/axios";

const HelpButton = ({ learningId }: { learningId: string }) => {
  const [helpOn, setHelpOn] = useState(false);

  const className = helpOn ? styles.helpOnButton : styles.helpOffButton;
  const helpText = helpOn ? "ヘルプon" : "ヘルプoff";

  // TODO: 親コンポーネントで実行する？
  const clickHelpButton = async () => {
    const res = await customAxios.put(`/learnings/${learningId}/help`);

    setHelpOn(res.data.learning.helping);
  };

  return (
    <button
      className={`${styles.helpButton} ${className}`}
      onClick={clickHelpButton}
    >
      {helpText}
    </button>
  );
};

export default HelpButton;
