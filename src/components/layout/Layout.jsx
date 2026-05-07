import { useEffect, useState } from "react";
import { theme } from "../../theme";
import Header from "./Header";
import Navbar from "./Navbar";
import TourGuide from "../TourGuide";
import useAuthStore from "../../stores/authStore";

export default function Layout({ children }) {
  const { isAuthenticated } = useAuthStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebarCollapse = () =>
    setIsSidebarCollapsed((prev) => !prev);

  const sidebarMargin =
    isAuthenticated && isSidebarOpen
      ? isSidebarCollapsed
        ? "md:ml-20"
        : "md:ml-64"
      : "";

  return (
    <div className="flex min-h-screen flex-col">
      {/* ✅ Tour Guide */}
      {isAuthenticated && <TourGuide />}

      {/* ✅ Header MUST have ID */}
      <Header
        id="tour-header"   // 🔥 IMPORTANT
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* ✅ Sidebar MUST have ID */}
        <Navbar
          id="tour-sidebar"  // 🔥 IMPORTANT
          isSidebarOpen={isSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
          closeSidebar={closeSidebar}
        />

        {/* ✅ Main already correct */}
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