import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/authApi";
import { getCompanies, createCompany } from "../api/companyApi";
import { signupSchema } from "../schemas/authSchemas";
import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";
import Select from "../components/common/Select";

export default function Signup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newCompanyName, setNewCompanyName] = useState("");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const companies = companiesData?.data || [];

  const createCompanyMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: (response) => {
      queryClient.invalidateQueries(["companies"]);
      setNewCompanyName("");
      const company = response.data;
      setValue("company_id", String(company.id));
    },
  });

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      navigate("/login");
    },
    onError: () => {
      // Error handled by form
    },
  });

  const handleCreateCompany = () => {
    const trimmedName = newCompanyName.trim();
    if (!trimmedName) return;
    createCompanyMutation.mutate({ name: trimmedName });
  };

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      company_id: data.company_id || undefined,
      role: data.role || "user",
    };
    signupMutation.mutate(payload);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 md:p-8 shadow rounded-lg w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">Join Costro today</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Create Company</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleCreateCompany}
                disabled={!newCompanyName.trim() || createCompanyMutation.isLoading}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createCompanyMutation.isLoading ? "Creating..." : "Create"}
              </button>
            </div>
            <p className="text-xs text-gray-500">Create a company record first, then choose it from the dropdown below.</p>
            {createCompanyMutation.isError && (
              <p className="text-red-500 text-xs md:text-sm mt-1">
                {createCompanyMutation.error?.response?.data?.message || "Could not create company."}
              </p>
            )}
            {createCompanyMutation.isSuccess && (
              <p className="text-green-600 text-xs md:text-sm mt-1">Company created and selected.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <Select
              {...register("company_id")}
              className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>
            {companies.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No companies available yet.</p>
            )}
            {errors.company_id && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.company_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select
              {...register("role")}
              className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="super admin">Super Admin</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            showCriteria
            {...register("password")}
            error={errors.password?.message}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          {signupMutation.isError && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded">
              {signupMutation.error?.response?.data?.message || "Signup failed"}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:py-3 rounded-lg transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={signupMutation.isLoading}
          >
            {signupMutation.isLoading ? "Signing up..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm md:text-base text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
