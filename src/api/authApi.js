import api from "./axios";

export const login = (data) => api.post("/auth/login", data);
export const signup = (data) => api.post("/auth/signup", data);
export const getUserDetails = () => api.get("/auth/me");
export const updateOnboarding = (onboardingData) => api.put("/auth/onboarding", onboardingData);
export const updateOnboardingStep = (data) => api.put("/auth/update-onboarding-step", data);
export const setPassword = (data) => api.post("/users/set-password", data);
export const validateToken = (token) => api.post("/users/validate-token", { token });
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);
