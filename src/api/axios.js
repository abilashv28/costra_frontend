import axios from "axios";
import { showSuccessToast, showErrorToast } from "../utils/toastHelper";

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

const shouldShowToastForResponse = (config) => {
  const method = config?.method?.toLowerCase();
  return ["post", "put", "patch", "delete"].includes(method);
};

const getSuccessToastMessage = (response) => {
  return response.data?.message || response.config?.toastMessage || "Operation completed successfully!";
};

api.interceptors.response.use(
  (response) => {
    // Show success toast only for create/update/delete actions
    if (shouldShowToastForResponse(response.config) && response.data?.success) {
      showSuccessToast(getSuccessToastMessage(response));
    }
    return response.data;
  },
  (error) => {
    const config = error.response?.config || error.config;
    const message = error.response?.data?.message || "An error occurred";
    if (shouldShowToastForResponse(config)) {
      showErrorToast(message);
    }
    return Promise.reject(error);
  }
);

export default api;