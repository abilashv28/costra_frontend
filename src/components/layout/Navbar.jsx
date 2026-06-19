import { Link, useLocation } from "react-router-dom";
import { PieChart, Building2, Wallet, ListCollapse, CreditCard, Users, Briefcase, Activity } from "lucide-react/dist/esm/lucide-react.mjs";
import useAuthStore from "../../stores/authStore";
import { theme } from "../../theme";

const isAdminOrSuperAdminRole = (role) => {
  const normalized = role?.toString().trim().toLowerCase();
  return normalized === "admin" || normalized === "super admin" || normalized === "superadmin";
};

export default function Navbar({ isSidebarCollapsed, toggleSidebarCollapse }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const isAdminOrSuperAdmin = isAdminOrSuperAdminRole(user?.role);

  if (!isAuthenticated) return null;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navItems = [];
  
  if (isAdminOrSuperAdmin) {
    navItems.push({ id: "Dashboard", path: "/", icon: PieChart, label: "Dashboard" });
  }
  
  navItems.push({ id: "Projects", path: "/projects", icon: Building2, label: "Projects" });
  navItems.push({ id: "Expenses", path: "/expenses", icon: Wallet, label: "Expenses" });
  
  if (isAdminOrSuperAdmin) {
    navItems.push({ id: "Payment", path: "/payment", icon: CreditCard, label: "Payment" });
    navItems.push({ id: "Clients", path: "/clients", icon: Briefcase, label: "Clients" });
    navItems.push({ id: "Users", path: "/users", icon: Users, label: "Users" });
    navItems.push({ id: "Audit Logs", path: "/audit-logs", icon: Activity, label: "Audit Logs" });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${theme.layout.sidebar} hidden md:flex flex-col ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
        <div className={`relative flex items-center justify-between mb-8 mt-2 ${isSidebarCollapsed ? "px-1" : "px-2"}`}>
          <div className="flex items-center gap-2">
            {isSidebarCollapsed ? (
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">C</span>
            ) : (
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Costro</h2>
            )}
          </div>
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="inline-flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-slate-300 hover:text-white"
          >
            <ListCollapse size={isSidebarCollapsed ? 18 : 20} />
          </button>
        </div>

        <nav id="tour-sidebar" className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.id}
              id={item.id} 
              to={item.path} 
              className={`${isActive(item.path) ? theme.layout.navLinkActive : theme.layout.navLink} ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
            >
              <item.icon size={isSidebarCollapsed ? 24 : 22} />
              <span className={`${isSidebarCollapsed ? "sr-only" : "ml-2"}`}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className={theme.layout.bottomNav}>
        {navItems.map((item) => (
          <Link 
            key={item.id}
            to={item.path} 
            className={isActive(item.path) ? theme.layout.bottomNavLinkActive : theme.layout.bottomNavLink}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium leading-none mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
