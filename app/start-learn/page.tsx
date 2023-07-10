"use client";

import styles from "./styles.module.css";
import { useState } from "react";

export default function startLearn() {
  const [title, setTitle] = useState("");
  return (
    <div className="text-center">
      <h1 className={styles.pageTitle}>勉強開始</h1>
      <input
        className={styles.titleInput}
        placeholder={"勉強タイトルを入力してください"}
        type={"text"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className={styles.detailTextArea}
        name=""
        id=""
        placeholder="勉強する内容を入力してください"
      ></textarea>
      <button className={styles.submitButton}>勉強開始</button>
    </div>
  );
}
