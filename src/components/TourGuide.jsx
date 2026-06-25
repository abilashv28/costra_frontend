import { useEffect, useState } from "react";
import { useTour } from "@reactour/tour";
import useAuthStore from "../stores/authStore";

export default function TourGuide() {
  const { user } = useAuthStore();
  const { setIsOpen, setCurrentStep, setSteps } = useTour();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getTourSteps = (userRole, isMobile) => {
    const isAdminOrSuperAdmin = userRole === "admin" || userRole === "super admin";

    // Welcome step (desktop only - sidebar visible on desktop)
    const welcomeStep = !isMobile ? [
      {
        selector: "#tour-sidebar",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Welcome to Costro</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Let me show you around. Use the sidebar to navigate between different sections of the application.</p>
          </div>
        )
      },
    ] : [
      {
        selector: "#tour-header",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Welcome to Costro</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Let me show you around the application. Tap the menu icon to access navigation.</p>
          </div>
        )
      },
    ];

    const adminSteps = !isMobile ? [
      {
        selector: "#Dashboard",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Dashboard</h3>
            <p className="text-sm text-gray-700 leading-relaxed">View an overview of your projects, expenses, and payments at a glance.</p>
          </div>
        )
      },
    ] : [];

    // Steps for all authenticated users (skip on mobile)
    const userSteps = !isMobile ? [
      {
        selector: "#Projects",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Projects</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Manage all your construction and interior projects here. Create, edit, or delete projects as needed.</p>
          </div>
        )
      },
      {
        selector: "#Clients",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Clients</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Manage your clients. You must create clients to assign them to your new projects.</p>
          </div>
        )
      },
      {
        selector: "#Expenses",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Expenses</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Track and manage all project-related expenses. Upload attachments and categorize your spending.</p>
          </div>
        )
      },
      {
        selector: "#Vendors",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Vendors</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Track vendor details and associate them with projects to accurately monitor service costs.</p>
          </div>
        )
      },
    ] : [];

    // Payment steps (admin/superadmin only, skip on mobile)
    const paymentSteps = !isMobile && isAdminOrSuperAdmin ? [
      {
        selector: "#Payment",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Payments</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Track payment stages and manage project payments in one place.</p>
          </div>
        )
      },
    ] : [];

    // Users steps (admin/superadmin only, skip on mobile)
    const usersSteps = !isMobile && isAdminOrSuperAdmin ? [
      {
        selector: "#Users",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Users</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Manage all team members and their access levels to the system.</p>
          </div>
        )
      },
      {
        selector: "#Audit Logs",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Audit Logs</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Review all the critical actions and changes that happen inside your company.</p>
          </div>
        )
      },
    ] : [];

    // User menu and main area (for all)
    const finaleSteps = [
      {
        selector: "#tour-main",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Main Workspace</h3>
            <p className="text-sm text-gray-700 leading-relaxed">This is your main working area where you'll spend most of your time. All your data and operations happen here.</p>
          </div>
        )
      },
      {
        selector: "#tour-header",
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">User Menu</h3>
            <p className="text-sm text-gray-700 leading-relaxed">Access your profile settings and logout from here. You can manage your account preferences.</p>
          </div>
        )
      },
    ];

    // Combine steps based on role and device type
    let allSteps = [...welcomeStep];

    if (isAdminOrSuperAdmin) {
      allSteps = [...allSteps, ...adminSteps];
    }

    allSteps = [...allSteps, ...userSteps];

    if (isAdminOrSuperAdmin) {
      allSteps = [...allSteps, ...paymentSteps, ...usersSteps];
    }

    allSteps = [...allSteps, ...finaleSteps];

    return allSteps;
  };

  useEffect(() => {
    if (!user || Number(user.onboarding_step) !== 0) return;

    // Update tour steps based on user role and device type
    const steps = getTourSteps(user.role, isMobile);
    setSteps(steps);

    // ✅ small delay so layout is ready
    const timer = setTimeout(() => {
      setCurrentStep(0);
      setIsOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [user, isMobile]);

  return null;
}