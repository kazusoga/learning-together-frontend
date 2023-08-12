import Link from "next/link";
import styles from "./styles.module.css";
import Logout from "../logout";

export default function Header() {
  return (
    <div className={styles.header}>
      <Link href="/">Learning Together</Link>
      <div className={styles.userIcon}></div>
      <div>
        <Link href="/register">新規登録</Link>
        <Link href="/login">ログイン</Link>
        <Logout />
      </div>
    </div>
  );
}
