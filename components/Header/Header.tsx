"use client";

import Link from "next/link";
import styles from "./styles.module.css";
import Logout from "../logout";

import { useloginUserContext } from "@/app/providers";

export default function Header() {
  const loginUser = useloginUserContext();

  return (
    <div className={styles.header}>
      <Link href="/">Learning Together</Link>
      {loginUser && (
        <>
          <div className={styles.userIcon}></div>
          <Logout />
        </>
      )}
      {!loginUser && (
        <div className={styles.buttons}>
          <Link href="/register">新規登録</Link>
          <div className={styles.divider}></div>
          <Link href="/login">ログイン</Link>
        </div>
      )}
    </div>
  );
}
