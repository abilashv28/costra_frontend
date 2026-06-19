import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import { loginSchema } from "../schemas/authSchemas";
import useAuthStore from "../stores/authStore";
import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";

export default function Login() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      loginStore({ user: response.data.user, token: response.data.token });
      navigate("/");
    },
    onError: () => {
      // Error handled by form
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 md:p-8 shadow rounded-lg w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Login</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">Welcome back to Costro</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </Link>
          </div>

          {loginMutation.isError && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded">
              {loginMutation.error?.response?.data?.message || "Invalid credentials"}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 text-white font-medium py-2 md:py-3 rounded-lg transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loginMutation.isLoading}
          >
            {loginMutation.isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* <p className="mt-6 text-center text-sm md:text-base text-gray-600">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Signup
          </Link>
        </p> */}
      </div>
    </div>
  );
}