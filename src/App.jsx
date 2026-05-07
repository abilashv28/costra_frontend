import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return isSignUp ? (
      <SignUp onSwitchToSignIn={() => setIsSignUp(false)} />
    ) : (
      <SignIn onSwitchToSignUp={() => setIsSignUp(true)} />
    );
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;