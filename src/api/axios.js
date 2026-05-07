import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.request.use((config) => {
  // Get token from localStorage directly to ensure it's available
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      const token = parsed.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Show success toast if response has success: true
    if (response.data && response.data.success) {
      toast.success(response.data.message || "Operation completed successfully!");
    }
    return response.data;
  },
  (error) => {
    // Show error toast
    const message = error.response?.data?.message || "An error occurred";
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;