import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjects } from "../api/projectApi";
import { getPaymentStages } from "../api/paymentStagesApi";
import {
  createProjectPayment,
  getProjectPayments,
  updateProjectPayment,
  deleteProjectPayment,
} from "../api/projectPaymentApi";
import { ArrowLeft } from "lucide-react/dist/esm/lucide-react.mjs";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Table from "../components/common/Table";

const PAYMENT_MODES = ["cash", "check", "online", "credit"];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    stage_id: "",
    expected_amount: "",
    amount: "",
    payment_mode: "",
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Fetch project details
  const { data: projectsData, isLoading: isProjectsLoading, error: projectsError } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 0,
    retry: 2,
  });

  const project = projectsData?.data?.find((p) => p.id === parseInt(id));
  

  const { data: stagesData } = useQuery({
    queryKey: ["paymentStages"],
    queryFn: getPaymentStages,
  });

  const stages = stagesData?.data || [];

  // Fetch payments for the project
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["projectPayments", id],
    queryFn: () => getProjectPayments(id),
    enabled: !!id,
  });

  const payments = paymentsData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => {
      if (editingPaymentId) {
        return updateProjectPayment(id, editingPaymentId, payload);
      }
      return createProjectPayment(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["projectPayments", id]);
      resetForm();
      setIsPanelOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (paymentId) => deleteProjectPayment(id, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["projectPayments", id]);
      setDeleteConfirmation(null);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const selectedStage = stages.find((stage) => stage.id === parseInt(form.stage_id, 10));
    const payload = {
      stage_id: parseInt(form.stage_id, 10),
      stage_name: selectedStage?.name || "",
      expected_amount: form.expected_amount ? parseFloat(form.expected_amount) : null,
      amount: parseFloat(form.amount),
      payment_mode: form.payment_mode,
      payment_date: form.payment_date,
      notes: form.notes.trim(),
    };

    createMutation.mutate(payload);
  };

  const resetForm = () => {
    setForm({
      stage_id: "",
      expected_amount: "",
      amount: "",
      payment_mode: "",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setEditingPaymentId(null);
  };

  const handleCancel = () => {
    setIsPanelOpen(false);
    resetForm();
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    deleteMutation.mutate(deleteConfirmation.id);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const columns = [
    { key: "stage_name", label: "Stage Name" },
    { key: "expected_amount", label: "Expected Amount" },
    { key: "progress", label: "Progress" },
  ];

  if (!project) {
    if (isProjectsLoading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded bg-white p-4 md:p-6 shadow">
            <button
              onClick={() => navigate(-1)}
              className="rounded border border-gray-300 bg-white p-2 hover:bg-gray-50 transition"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <p className="text-lg font-medium text-gray-600">Loading project...</p>
          </div>
        </div>
      );
    }

    if (projectsError || !projectsData?.data) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded bg-white p-4 md:p-6 shadow">
            <button
              onClick={() => navigate(-1)}
              className="rounded border border-gray-300 bg-white p-2 hover:bg-gray-50 transition"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <p className="text-lg font-medium text-red-600">Error loading project</p>
              <p className="text-sm text-gray-500 mt-1">Project not found or an error occurred</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 rounded bg-white p-4 md:p-6 shadow">
          <button
            onClick={() => navigate(-1)}
            className="rounded border border-gray-300 bg-white p-2 hover:bg-gray-50 transition"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <p className="text-lg font-medium text-gray-600">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 rounded bg-white p-4 md:p-6 shadow">
        <button
          onClick={() => navigate(-1)}
          className="rounded border border-gray-300 bg-white p-2 hover:bg-gray-50 transition"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold">{project.name}</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Client: {project.client_name} | Location: {project.location}
          </p>
        </div>
      </div>

      {/* Project Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4 md:p-6">
          <p className="text-sm text-gray-500 font-medium">Project Type</p>
          <p className="text-lg md:text-xl font-semibold text-gray-900 mt-2">
            {project.projecttype}
          </p>
        </div>
        <div className="bg-white rounded shadow p-4 md:p-6">
          <p className="text-sm text-gray-500 font-medium">Budget</p>
          <p className="text-lg md:text-xl font-semibold text-gray-900 mt-2">
            ${project.budget?.toLocaleString() || "0.00"}
          </p>
        </div>
        <div className="bg-white rounded shadow p-4 md:p-6">
          <p className="text-sm text-gray-500 font-medium">Total Paid</p>
          <p className="text-lg md:text-xl font-semibold text-green-600 mt-2">
            $
            {payments
              .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
              .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Payments Section */}
      <section className="bg-white p-4 md:p-6 rounded shadow">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Payment Stages</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Add and manage stage-wise project payments
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Loading payments...</p>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No Stages added yet</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={
              payments.map((payment) => {
                const expectedAmount = payment.expected_amount ? parseFloat(payment.expected_amount) : null;
                const paidAmount = parseFloat(payment.amount || 0);
                const progressPercent = expectedAmount > 0 ? Math.min((paidAmount / expectedAmount) * 100, 100) : 0;

                return {
                  ...payment,
                  expected_amount: expectedAmount !== null ? `$${expectedAmount.toFixed(2)}` : "—",
                  progress: (
                    <div className="space-y-2">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full ${progressPercent >= 100 ? "bg-green-600" : "bg-blue-600"}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        {expectedAmount
                          ? `${progressPercent.toFixed(0)}% paid ($${paidAmount.toFixed(2)} / $${expectedAmount.toFixed(2)})`
                          : `$${paidAmount.toFixed(2)} paid`}
                      </p>
                    </div>
                  ),
                };
              }) || []
            }
          />
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={cancelDelete}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative rounded-lg bg-white p-4 md:p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Are you sure you want to delete payment for "{deleteConfirmation.stage_name}"?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 flex-wrap">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded border border-gray-300 bg-white px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMutation.isLoading}
                className="rounded bg-red-600 hover:bg-red-700 px-3 md:px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Payment Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex md:items-center md:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="absolute inset-0 bg-black/40 md:hidden"
          />
          <div className="relative w-full md:w-full md:max-w-md h-full md:h-auto md:rounded-lg flex flex-col overflow-y-auto bg-white p-4 md:p-6 shadow-xl md:mr-4">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">
                  {editingPaymentId ? "Edit Payment" : "Add Payment"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingPaymentId
                    ? "Update payment details and save."
                    : "Add stage payment details and save."}
                </p>
              </div>
              <span
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 font-semibold cursor-pointer transition text-sm md:text-base"
              >
                ✕
              </span>
            </div>

            <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Stage Name
                <Select
                  name="stage_id"
                  value={form.stage_id}
                  onChange={handleChange}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                  required
                >
                  <option value="">Select Stage</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Payment Mode
                <Select
                  name="payment_mode"
                  value={form.payment_mode}
                  onChange={handleChange}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </option>
                  ))}
                </Select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expected Amount"
                  type="number"
                  name="expected_amount"
                  value={form.expected_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />

                <Input
                  label="Actual Amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <Input
                label="Payment Date"
                type="date"
                name="payment_date"
                value={form.payment_date}
                onChange={handleChange}
                required
              />

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes..."
                  rows="3"
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full resize-none"
                />
              </label>

              {createMutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  Failed to {editingPaymentId ? "update" : "add"} payment. Please try again.
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isLoading
                    ? "Saving..."
                    : editingPaymentId
                      ? "Update"
                      : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
