"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDispatchContext } from "../providers";

export default function Register() {
  const router = useRouter();
  const dispatch = useDispatchContext();

  const [username, setUsername] = React.useState("");
  const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const [email, setEmail] = React.useState("");
  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const [password, setPassword] = React.useState("");
  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const register = async () => {
    let res;
    try {
      res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/register`,
        {
          name: username,
          email: email,
          password: password,
        },
        { withCredentials: true }
      );
      console.log(res);
    } catch (error) {
      console.log(error);
      alert("登録に失敗しました");
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
      <h1>Register</h1>
      <input type="text" onChange={handleChangeUsername} />
      <br />
      <input type="email" onChange={handleChangeEmail} />
      <br />
      <input type="password" onChange={handleChangePassword} />
      <br />
      <button onClick={register}>登録</button>
    </div>
  );
}
