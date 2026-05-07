import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TourProvider, useTour } from "@reactour/tour";
import { theme } from "./theme";
import useAuthStore from "./stores/authStore";
import * as authApi from "./api/authApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

const steps = [
  {
    selector: "#tour-sidebar",
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Sidebar</h3>
        <p className="text-sm text-gray-700 leading-relaxed">Navigate between pages using this sidebar.</p>
      </div>
    )
  },
  {
    selector: "#tour-header",
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Header</h3>
        <p className="text-sm text-gray-700">Access profile, settings and notifications here.</p>
      </div>
    )
  },
  {
    selector: "#tour-main",
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Dashboard</h3>
        <p className="text-sm text-gray-700">This is your main working area.</p>
      </div>
    )
  }
];

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <TourProvider
      steps={steps}
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
                          toast.success(response.message || "Onboarding completed successfully!");
                        } else {
                          toast.error(response.message || "Failed to update onboarding");
                        }
                        const currentState = useAuthStore.getState();
                        currentState.updateOnboarding({
                          onboarding_step: 1,
                          is_tour_completed: true,
                        });
                      } catch (err) {
                        toast.error(err.response?.data?.message || "An error occurred while updating onboarding");
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
      <ToastContainer />
    </TourProvider>
  </QueryClientProvider>
);
