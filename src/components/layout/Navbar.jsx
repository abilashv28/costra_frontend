import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Building2, Wallet, ListCollapse, CreditCard, Users } from "lucide-react/dist/esm/lucide-react.mjs";
import useAuthStore from "../../stores/authStore";
import { theme } from "../../theme";

const isAdminOrSuperAdminRole = (role) => {
  const normalized = role?.toString().trim().toLowerCase();
  return normalized === "admin" || normalized === "super admin" || normalized === "superadmin";
};

export default function Navbar({ isSidebarOpen, isSidebarCollapsed, toggleSidebarCollapse, closeSidebar }) {
  const { isAuthenticated, user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const isAdminOrSuperAdmin = isAdminOrSuperAdminRole(user?.role);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <>
      <aside
        className={`${theme.layout.sidebar} ${isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full"} ${isSidebarCollapsed ? "md:w-20" : "md:w-64"} ${!isAuthenticated ? "hidden" : ""}`}>
        <div className={`relative flex items-center justify-between mb-6 py-6 ${isSidebarCollapsed ? "px-1" : "px-0"}`}>
          <div className="flex items-center gap-2">
            {isSidebarCollapsed ? (
              <span className="text-2xl font-bold">C</span>
            ) : (
              <h2 className="text-3xl font-bold">Costro</h2>
            )}
          </div>
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="hidden md:inline-flex items-center justify-center p-3 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <ListCollapse size={isSidebarCollapsed ? 16 : 20} />
          </button>
        </div>

        <nav id="tour-sidebar" className="flex flex-col gap-3">
          {isAuthenticated && (
            <>
              {isAdminOrSuperAdmin && (
                <Link to="/" onClick={handleNavLinkClick} className={`${theme.layout.navLink} ${isSidebarCollapsed ? "justify-center" : ""}`}>
                  <PieChart size={32} />
                  <span className={`${isSidebarCollapsed ? "sr-only" : "ml-2"}`}>Dashboard</span>
                </Link>
              )}
              <Link to="/projects" onClick={handleNavLinkClick} className={`${theme.layout.navLink} ${isSidebarCollapsed ? "justify-center" : ""}`}>
                <Building2 size={32} />
                <span className={`${isSidebarCollapsed ? "sr-only" : "ml-2"}`}>Projects</span>
              </Link>
              <Link to="/expenses" onClick={handleNavLinkClick} className={`${theme.layout.navLink} ${isSidebarCollapsed ? "justify-center" : ""}`}>
                <Wallet size={32} />
                <span className={`${isSidebarCollapsed ? "sr-only" : "ml-2"}`}>Expenses</span>
              </Link>
              {isAdminOrSuperAdmin && (
                <Link to="/payment" onClick={handleNavLinkClick} className={`${theme.layout.navLink} ${isSidebarCollapsed ? "justify-center" : ""}`}>
                  <CreditCard size={32} />
                  <span className={`${isSidebarCollapsed ? "sr-only" : "ml-2"}`}>Payment</span>
                </Link>
              )}
              {isAdminOrSuperAdmin && (
                <Link to="/users" onClick={handleNavLinkClick} className={`${theme.layout.navLink} ${isSidebarCollapsed ? "justify-center" : ""}`}>
                  <Users size={32} />
                  <span className={`${isSidebarCollapsed ? "sr-only" : "ml-2"}`}>Users</span>
                </Link>
              )}
            </>
          )}
          {!isAuthenticated ? (
            <>
              <Link to="/login" onClick={handleNavLinkClick} className={theme.layout.navLinkSecondary}>
                Login
              </Link>
              <Link to="/signup" onClick={handleNavLinkClick} className={theme.layout.navLinkSecondary}>
                Signup
              </Link>
            </>
          ) : null}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={closeSidebar} />}
    </>
  );
}
