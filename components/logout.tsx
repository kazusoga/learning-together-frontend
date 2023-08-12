"use client";
import axios from "axios";
import { useDispatchContext } from "../app/providers";

export default function Logout() {
  const dispatch = useDispatchContext();

  const logout = async () => {
    let res;
    try {
      res = await axios.post(
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

    dispatch({ type: "logout", payload: null });
  };
  return (
    <div>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}
