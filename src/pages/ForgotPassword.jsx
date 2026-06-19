import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../api/authApi";
import Input from "../components/common/Input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => forgotPassword(data),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }
    mutation.mutate({ email });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 md:p-8 shadow rounded-lg w-full max-w-md">
        {!submitted ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Reset Password</h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Enter your email to receive a password reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {mutation.isError && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded">
                  {mutation.error?.response?.data?.message || "Failed to send reset email"}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 text-white font-medium py-2 md:py-3 rounded-lg transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm md:text-base text-gray-600">
              Remember your password?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Login
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. Please check your email and click the link to reset your password.
            </p>
            <Link
              to="/login"
              className="w-full inline-block bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 text-white font-medium py-2 md:py-3 rounded-lg transition text-sm md:text-base"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
