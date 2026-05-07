import { useEffect } from "react";
import { useTour } from "@reactour/tour";
import useAuthStore from "../stores/authStore";

export default function TourGuide() {
  const { user } = useAuthStore();
  const { setIsOpen, setCurrentStep } = useTour();

  useEffect(() => {
    if (!user || Number(user.onboarding_step) !== 0) return;

    // ✅ small delay so layout is ready
    const timer = setTimeout(() => {
      setCurrentStep(0);
      setIsOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  return null;
}