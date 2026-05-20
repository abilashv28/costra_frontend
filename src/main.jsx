import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TourProvider, useTour } from "@reactour/tour";
import { theme } from "./theme";
import useAuthStore from "./stores/authStore";
import * as authApi from "./api/authApi";
import { showSuccessToast, showErrorToast } from "./utils/toastHelper";

const queryClient = new QueryClient();

const getTourSteps = (userRole) => {
  const isAdminOrSuperAdmin = userRole === "admin" || userRole === "super admin";

  // Common steps for all roles
  const commonSteps = [
    {
      selector: "#tour-sidebar",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Welcome to Costro</h3>
          <p className="text-sm text-gray-700 leading-relaxed">Let me show you around. Use the sidebar to navigate between different sections of the application.</p>
        </div>
      )
    },
  ];

  // Admin/Superadmin specific steps
  const adminSteps = [
    {
      selector: "#Dashboard",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Dashboard</h3>
          <p className="text-sm text-gray-700 leading-relaxed">View an overview of your projects, expenses, and payments at a glance.</p>
        </div>
      )
    },
    {
      selector: "#Projects",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Projects</h3>
          <p className="text-sm text-gray-700 leading-relaxed">Manage all your construction and interior projects here. Create, edit, or delete projects as needed.</p>
        </div>
      )
    },
  ];

  // Steps for all authenticated users
  const userSteps = [
    {
      selector: "#Expenses",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Expenses</h3>
          <p className="text-sm text-gray-700 leading-relaxed">Track and manage all project-related expenses. Upload attachments and categorize your spending.</p>
        </div>
      )
    },
  ];

  // Payment steps (admin/superadmin only)
  const paymentSteps = [
    {
      selector: "#Payment",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Payments</h3>
          <p className="text-sm text-gray-700 leading-relaxed">Track payment stages and manage project payments in one place.</p>
        </div>
      )
    },
  ];

  // Users steps (admin/superadmin only)
  const usersSteps = [
    {
      selector: "#Users",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Users</h3>
          <p className="text-sm text-gray-700 leading-relaxed">Manage all team members and their access levels to the system.</p>
        </div>
      )
    },
  ];

  // User menu and main area (for all)
  const finaleSteps = [
    {
      selector: "#tour-header",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">User Menu</h3>
          <p className="text-sm text-gray-700 leading-relaxed">Access your profile settings and logout from here. You can manage your account preferences.</p>
        </div>
      )
    },
    {
      selector: "#tour-main",
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Main Workspace</h3>
          <p className="text-sm text-gray-700 leading-relaxed">This is your main working area where you'll spend most of your time. All your data and operations happen here.</p>
        </div>
      )
    }
  ];

  // Combine steps based on role
  let allSteps = [...commonSteps];

  if (isAdminOrSuperAdmin) {
    allSteps = [...allSteps, ...adminSteps, ...userSteps];
  }

  allSteps = [...allSteps, ...userSteps];

  if (isAdminOrSuperAdmin) {
    allSteps = [...allSteps, ...paymentSteps, ...usersSteps];
  }

  allSteps = [...allSteps, ...finaleSteps];

  return allSteps;
};

// Get initial steps - will be updated when user loads
const initialSteps = getTourSteps("user");

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <TourProvider
      steps={initialSteps}
      showCloseButton
      showDots={false}
      showNavigation={false}
      components={{
        Content: ({ content }) => {
          const { currentStep, setCurrentStep, steps, setIsOpen } = useTour();

          const isLast = currentStep === steps.length - 1;

          return (
            <div className="flex flex-col">
              {/* Content */}
              <div className="mb-5">{content}</div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                {/* Dots */}
                <div className="flex gap-2">
                  {steps.map((_, i) => (
                    <div key={i} className={`h-2 w-2 rounded-full ${i === currentStep ? "bg-blue-500" : "bg-gray-300"}`} />
                  ))}
                </div>

                {/* Button */}
                <button
                  onClick={async () => {
                    if (isLast) {
                      try {
                        const response = await authApi.updateOnboardingStep({
                          onboarding_step: 1,
                        });
                        if (response.success) {
                          showSuccessToast(response.message || "Onboarding completed successfully!");
                        } else {
                          showErrorToast(response.message || "Failed to update onboarding");
                        }
                        const currentState = useAuthStore.getState();
                        currentState.updateOnboarding({
                          onboarding_step: 1,
                          is_tour_completed: true,
                        });
                      } catch (err) {
                        showErrorToast(err.response?.data?.message || "An error occurred while updating onboarding");
                        console.error(err);
                      }
                      setIsOpen(false);
                    } else {
                      setCurrentStep(s => s + 1);
                    }
                  }}
                  className={`${theme.button.base} ${theme.button.primary} rounded-lg text-sm font-semibold px-4 py-2`}>
                  {isLast ? "Done" : "Next"}
                </button>
              </div>
            </div>
          );
        }
      }}
      styles={{
        popover: base => ({
          ...base,
          background: "#ffffff",
          color: "#1f2937",
          borderRadius: "16px",
          padding: "20px",
          width: "320px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          border: "1px solid rgba(0,0,0,0.08)"
        }),

        close: base => ({
          ...base,
          position: "absolute",
          top: 10,
          right: 10,
          color: "#000000",
          fontSize: "20px"
        })
      }}>
      {/* ✅ IMPORTANT: App must be inside TourProvider */}
      <App />
    </TourProvider>
  </QueryClientProvider>
);
