import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppTourProvider } from "./providers/AppTourProvider";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <AppTourProvider>
      {/* ✅ IMPORTANT: App must be inside TourProvider */}
      <App />
    </AppTourProvider>
  </QueryClientProvider>
);
