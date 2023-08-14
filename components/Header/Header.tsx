"use client";

import Link from "next/link";
import styles from "./styles.module.css";
import Logout from "../logout";

import { useState } from "react";
import { Menu, MenuItem } from "@mui/material";

import { useloginUserContext } from "@/app/providers";

export default function Header() {
  const loginUser = useloginUserContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <div className={styles.header}>
      <Link href="/">Learning Together</Link>
      {loginUser && (
        <>
          <Menu
            id="menu-app-bar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            MenuListProps={{ onMouseLeave: handleClose }}
          >
            <MenuItem>
              <Logout />
            </MenuItem>
          </Menu>
          <div className={styles.userIcon} onMouseOver={handleMenu}></div>
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
