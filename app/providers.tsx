"use client";

import { createContext, useContext, useReducer } from "react";

type loginUser = {
  id: number;
  name: string;
} | null;

type Action = {
  type: "login" | "logout";
  payload: loginUser;
};

// リロード時に、ローカルストレージから取得
const loginUserFromLocalStorage = (): loginUser => {
  const loginUser = localStorage.getItem("loginUser");
  if (loginUser) {
    return JSON.parse(loginUser);
  }
  return null;
};

const defaultState: loginUser = loginUserFromLocalStorage();

const Context = createContext<loginUser>(defaultState);

// reducerを作成
const reducer = (loginUser: loginUser, action: Action): loginUser => {
  switch (action.type) {
    case "login":
      if (action.payload === null) {
        localStorage.removeItem("loginUser");
        return null;
      }

      // ローカルストレージに保存
      localStorage.setItem("loginUser", JSON.stringify(action.payload));

      return {
        id: action.payload.id,
        name: action.payload.name,
      };
    case "logout":
      // ローカルストレージから削除
      localStorage.removeItem("loginUser");
      return null;
  }
};

const DispatchContext = createContext((() => 0) as React.Dispatch<any>);

export const useloginUserContext = () => useContext<loginUser>(Context);
export const useDispatchContext = () => useContext(DispatchContext);

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  return (
    <Context.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </Context.Provider>
  );
};
