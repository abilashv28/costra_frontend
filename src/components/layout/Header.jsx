import { useState } from "react";
import { LogOut, ChevronDown, Users } from "lucide-react/dist/esm/lucide-react.mjs";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { theme } from "../../theme";
import Button from "../common/Button";

export default function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdminOrSuperAdmin = user?.role === "admin" || user?.role === "super admin";

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleUsersClick = () => {
    setUserMenuOpen(false);
    navigate("/users");
  };

  return (
    <header id="tour-header" className={theme.layout.header}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Mobile Spacer to keep right side aligned if needed, or just let logo/title take space */}
        <div className="w-10 md:hidden flex items-center">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">C</span>
        </div>

        {/* Right Side User Menu */}
        {isAuthenticated && (
          <div className="relative ml-auto">
            <Button onClick={() => setUserMenuOpen(!userMenuOpen)} variant="nav">
              <div className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <span className="hidden md:inline-block text-sm md:text-base font-medium">
                {user?.name || "User"}
              </span>

              <ChevronDown size={20} />
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Logged in as</p>
                  <p className="font-semibold text-gray-900">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || ""}
                  </p>
                </div>

                {isAdminOrSuperAdmin && (
                  <Button
                    onClick={handleUsersClick}
                    variant="userMenu"
                    className="justify-start"
                  >
                    <Users size={20} />
                    Users
                  </Button>
                )}

                <Button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  variant="userMenu"
                  className="justify-start"
                >
                  <LogOut size={20} />
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}