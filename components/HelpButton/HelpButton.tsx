// 「ヘルプoff」ボタンを作成する。
// クリックすると、ヘルプonになる。
"use client";
import styles from "./styles.module.css";
import { useState } from "react";
import axios from "axios";

const HelpButton = ({ learningId }: { learningId: string }) => {
  const [helpOn, setHelpOn] = useState(false);

  const className = helpOn ? styles.helpOnButton : styles.helpOffButton;
  const helpText = helpOn ? "ヘルプon" : "ヘルプoff";

  // TODO: 親コンポーネントで実行する？
  const clickHelpButton = async () => {
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE}/learnings/${learningId}/help`
    );

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
