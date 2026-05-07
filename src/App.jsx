import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes/AppRoutes";
import Layout from "./components/layout/Layout";
import useAuthStore from "./stores/authStore";

const queryClient = new QueryClient();

export default function App() {
  const logout = useAuthStore((state) => state.logout);
  const sessionExpiry = useAuthStore((state) => state.sessionExpiry);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !sessionExpiry) return;

    const remainingTime = sessionExpiry - Date.now();
    if (remainingTime <= 0) {
      logout();
      window.location.href = "/login";
      return;
    }

    // Warning 5 minutes before logout
    const warningTime = remainingTime - 5 * 60 * 1000;
    let warningTimeoutId;
    if (warningTime > 0) {
      warningTimeoutId = setTimeout(() => {
        toast.warn("Your session will expire in 5 minutes. Please save your work.", {
          icon: "⚠️",
          autoClose: 5000,
          position: "top-right",
          pauseOnHover: true,
        });
      }, warningTime);
    }

    const logoutTimeoutId = setTimeout(() => {
      logout();
      window.location.href = "/login";
    }, remainingTime);

    return () => {
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      clearTimeout(logoutTimeoutId);
    };
  }, [isAuthenticated, sessionExpiry, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
        <ToastContainer position="top-right" theme="colored" pauseOnHover />
      </BrowserRouter>
    </QueryClientProvider>
  );
}