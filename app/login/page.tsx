"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDispatchContext } from "../providers";

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

  const dispatch = useDispatchContext();

  const login = async () => {
    let res;
    try {
      res = await axios.post(
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

    dispatch({ type: "login", payload: res.data.user });

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
