import { useState } from "react";
import { theme } from "../../theme";
import Header from "./Header";
import Navbar from "./Navbar";
import TourGuide from "../TourGuide";
import useAuthStore from "../../stores/authStore";

export default function Layout({ children }) {
  const { isAuthenticated } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => setIsSidebarCollapsed((prev) => !prev);

  // Margin only applies on desktop (md:) since mobile uses bottom nav.
  const sidebarMargin =
    isAuthenticated
      ? isSidebarCollapsed
        ? "md:ml-20"
        : "md:ml-64"
      : "";

  return (
    <div className="flex min-h-[100dvh] flex-col font-sans bg-slate-50">
      {/* ✅ Tour Guide */}
      {isAuthenticated && <TourGuide />}

      {/* ✅ Header MUST have ID */}
      <Header id="tour-header" />

      <div className="flex flex-1 flex-col md:flex-row relative">
        {/* ✅ Sidebar/Bottom Nav MUST have ID */}
        <Navbar
          id="tour-sidebar"
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
        />

        {/* ✅ Main Content Area */}
        <main
          id="tour-main"
          className={`${theme.layout.main} ${sidebarMargin}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}