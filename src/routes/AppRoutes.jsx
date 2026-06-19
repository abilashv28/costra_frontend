import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";
import Expenses from "../pages/Expenses";
import Payment from "../pages/Payment";
import Users from "../pages/Users";
import Clients from "../pages/Clients";
import AuditLogs from "../pages/AuditLogs";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import SetPassword from "../pages/SetPassword";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Unauthorized from "../pages/Unauthorized";
import useAuthStore from "../stores/authStore";

const isAdminOrSuperAdminRole = (role) => {
  const normalized = role?.toString().trim().toLowerCase();
  return normalized === "admin" || normalized === "super admin" || normalized === "superadmin";
};

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdminOrSuperAdmin = isAdminOrSuperAdminRole(user?.role);
  const defaultAuthenticatedPath = isAdminOrSuperAdmin ? "/" : "/projects";

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdminOrSuperAdmin ? (
              <Dashboard />
            ) : (
              <Navigate to="/projects" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/projects"
        element={isAuthenticated ? <Projects /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/projects/:id"
        element={isAuthenticated ? <ProjectDetails /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/expenses"
        element={isAuthenticated ? <Expenses /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/payment"
        element={
          isAuthenticated ? (
            isAdminOrSuperAdmin ? (
              <Payment />
            ) : (
              <Unauthorized />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/users"
        element={
          isAuthenticated ? (
            isAdminOrSuperAdmin ? (
              <Users />
            ) : (
              <Unauthorized />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/clients"
        element={
          isAuthenticated ? (
            isAdminOrSuperAdmin ? (
              <Clients />
            ) : (
              <Unauthorized />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/audit-logs"
        element={
          isAuthenticated ? (
            isAdminOrSuperAdmin ? (
              <AuditLogs />
            ) : (
              <Unauthorized />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to={defaultAuthenticatedPath} replace />}
      />
      <Route
        path="/signup"
        element={!isAuthenticated ? <Signup /> : <Navigate to={defaultAuthenticatedPath} replace />}
      />
    </Routes>
  );
}