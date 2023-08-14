import axios from "axios";

const customAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: true,
});

export default customAxios;
