"use client";
import axios from "axios";

export default function Logout() {
  const logout = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/logout`,
        {},
        { withCredentials: true }
      );
      console.log(res);
    } catch (error) {
      console.log(error);
      alert("ログアウトに失敗しました");
      return;
    }
  };
  return (
    <div>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}
