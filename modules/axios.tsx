import axios from "axios";

const customAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: true,
});

customAxios.interceptors.response.use(
  (response) => {
    // レスポンスの成功時に実行される処理
    return response;
  },
  (error) => {
    // レスポンスのエラー時に実行される処理
    console.error(error);
    throw error;
  }
);

export default customAxios;
