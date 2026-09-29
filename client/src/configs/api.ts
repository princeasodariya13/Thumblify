import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});


// Silently handle 401 on /verify — expected when user is not logged in
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isVerifyRoute = error.config?.url?.includes("/api/auth/verify");
    if (error.response?.status === 401 && isVerifyRoute) {
      // Not an error — user simply isn't logged in yet
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;