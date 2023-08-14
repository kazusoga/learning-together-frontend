"use client";
import customAxios from "@/modules/axios";
import { useDispatchContext } from "../app/providers";

export default function Logout() {
  const dispatch = useDispatchContext();

  const logout = async () => {
    let res;
    try {
      res = await customAxios.post(`logout`);
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
