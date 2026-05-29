import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.BACKEND_URL,
  withCredentials: true,
});

export const setAuthHeader = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export default api;
