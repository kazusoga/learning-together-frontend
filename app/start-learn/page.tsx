"use client";

import styles from "./styles.module.css";
import { useState } from "react";
import customAxios from "@/modules/axios";
import { useRouter } from "next/navigation";

export default function startLearn() {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const router = useRouter();

  const submit = async () => {
    const res = await customAxios.post(`/learnings`, {
      title: title,
      detail: detail,
      helping: true,
    });

    if (res.status === 200) {
      alert("勉強を開始しました");
      // TOPページに遷移する
      router.push("/", { rerunning: true });
    } else {
      alert("エラーが発生しました");
    }
  };
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
        onChange={(e) => setDetail(e.target.value)}
      ></textarea>
      <button className={styles.submitButton} onClick={submit}>
        勉強開始
      </button>
    </div>
  );
}
