import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword, validateToken } from "../api/authApi";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const { data: tokenData, isLoading: validatingToken } = useQuery({
    queryKey: ["validate-token", token],
    queryFn: () => validateToken(token),
    enabled: !!token,
  });

  const tokenValid = tokenData?.data?.valid;

  const mutation = useMutation({
    mutationFn: (data) => resetPassword({ token, ...data }),
    onSuccess: () => {
      navigate("/login");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setPasswordMismatch(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    mutation.mutate({
      password: form.password,
    });
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new password reset link.
            </p>
            <Button onClick={() => navigate("/forgot-password")} className="w-full">
              Request New Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <PasswordInput
              label="New Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter your new password"
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your new password"
            />
          </div>

          {passwordMismatch && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
              Passwords do not match
            </div>
          )}

          {mutation.isError && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
              {mutation.error?.response?.data?.message || "Failed to reset password. Please try again."}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Resetting Password..." : "Reset Password & Login"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
