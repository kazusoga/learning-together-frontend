"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const [password, setPassword] = React.useState("");

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const login = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/login`,
        {
          email: email,
          password: password,
        },
        { withCredentials: true }
      );
      console.log(res);
    } catch (error) {
      console.log(error);
      alert("ログインに失敗しました");
      return;
    }

    router.push("/");
  };

  useEffect(() => {
    // csrf 保護初期化
    axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  }, []);

  return (
    <div>
      <h1>Login</h1>
      <input type="text" name="email" onChange={handleChangeEmail} />
      <br />
      <input type="password" name="password" onChange={handleChangePassword} />
      <br />
      <button onClick={login}>ログイン</button>
    </div>
  );
}
