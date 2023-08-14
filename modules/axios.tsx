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

    const status = error.response ? error.response.status : 500;
    if (status === 419 || status === 401) {
      window.location.href = "/login";
      return;
    }

    throw error;
  }
);

export default customAxios;
