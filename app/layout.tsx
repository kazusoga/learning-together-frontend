import "./globals.css";
import styles from "./styles.module.css";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={styles.header}>
          <Link href="/">Learning Together</Link>
          <div className={styles.userIcon}></div>
        </div>
        {children}
      </body>
    </html>
  );
}
