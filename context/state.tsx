"use client";

import { createContext, useContext } from "react";

const MyContext = createContext({
  number: 0,
  text: "",
});

export const MyProvider = ({ children }: { children: React.ReactNode }) => {
  const sharedState = {
    number: 123,
    text: "test",
  };

  return (
    <MyContext.Provider value={sharedState}>{children}</MyContext.Provider>
  );
};

// コンテキストオブジェクトにアクセスするためのカスタムフックを作成する
export function useMyContext() {
  return useContext(MyContext);
}
