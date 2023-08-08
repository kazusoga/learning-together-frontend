// 「ヘルプoff」ボタンを作成する。
// クリックすると、ヘルプonになる。
"use client";
import styles from "./styles.module.css";
import { useState } from "react";

const HelpButton = () => {
  const [helpOn, setHelpOn] = useState(false);

  const className = helpOn ? styles.helpOnButton : styles.helpOffButton;
  const helpText = helpOn ? "ヘルプon" : "ヘルプoff";

  return (
    <button
      className={`${styles.helpButton} ${className}`}
      onClick={() => {
        setHelpOn(!helpOn);
      }}
    >
      {helpText}
    </button>
  );
};

export default HelpButton;
