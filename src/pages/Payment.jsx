import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProjectPayment, getProjectPayments, deleteProjectPayment } from "../api/projectPaymentApi";
import { getProjects } from "../api/projectApi";
import { getPaymentStages, createPaymentStage } from "../api/paymentStagesApi";
import { Plus, Trash2, Download } from "lucide-react/dist/esm/lucide-react.mjs";
import { downloadExcel } from "../utils/exportUtils";
import useAuthStore from "../stores/authStore";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Table from "../components/common/Table";
import formatIndianAmount from "../utils/formatAmount";
import Unauthorized from "./Unauthorized";

const PAYMENT_MODES = ["cash", "check", "online", "credit"];

export default function Payment() {
  const { user } = useAuthStore();
  const isAdminOrSuperAdmin = user?.role === "admin" || user?.role === "super admin";
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    project_id: "",
    stage_id: "",
    expected_amount: "",
    amount: "",
    gst_applicable: false,
    gst_percent: "",
    gst_amount: "",
    payment_mode: "",
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showCreateStage, setShowCreateStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const projects = projectsData?.data || [];

  // Fetch payment stages
  const { data: stagesData } = useQuery({
    queryKey: ["paymentStages"],
    queryFn: getPaymentStages,
  });

  // Fetch all payments for all projects
  const { data: allPaymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["allPayments"],
    queryFn: async () => {
      if (!projectsData?.data?.length) return [];
      const paymentPromises = projectsData.data.map(project => getProjectPayments(project.id));
      const results = await Promise.all(paymentPromises);
      return results.flatMap((result, index) => 
        result.data.map(payment => ({ ...payment, projectName: projectsData.data[index].name }))
      );
    },
    enabled: !!projectsData?.data?.length,
  });

  const createMutation = useMutation({
    mutationFn: ({ projectId, payload }) => {
      return createProjectPayment(projectId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["projectPayments"]);
      queryClient.invalidateQueries(["allPayments"]);
      resetForm();
      setIsPanelOpen(false);
    },
  });

  const createStageMutation = useMutation({
    mutationFn: createPaymentStage,
    onSuccess: () => {
      queryClient.invalidateQueries(["paymentStages"]);
      setShowCreateStage(false);
      setNewStageName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ projectId, paymentId }) => deleteProjectPayment(projectId, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["projectPayments"]);
      queryClient.invalidateQueries(["allPayments"]);
      setDeleteConfirmation(null);
    },
  });

  if (!isAdminOrSuperAdmin) {
    return <Unauthorized />;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => {
      const next = { ...prev, [name]: val };
      // Recalculate gst_amount when amount or gst_percent or gst_applicable changes
      const amt = parseFloat(next.amount || 0);
      const pct = parseFloat(next.gst_percent || 0);
      if (next.gst_applicable) {
        next.gst_amount = isNaN(amt) ? "" : (amt * pct / 100).toFixed(2);
      } else {
        next.gst_amount = "";
      }
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const selectedStage = stages.find((stage) => stage.id === parseInt(form.stage_id, 10));
    const payload = {
      stage_id: parseInt(form.stage_id, 10),
      stage_name: selectedStage?.name || "",
      expected_amount: form.expected_amount ? parseFloat(form.expected_amount) : null,
      amount: parseFloat(form.amount),
      gst_applicable: !!form.gst_applicable,
      gst_percent: form.gst_applicable ? (form.gst_percent ? parseFloat(form.gst_percent) : 0) : null,
      gst_amount: form.gst_applicable ? (form.gst_amount ? parseFloat(form.gst_amount) : 0) : null,
      payment_mode: form.payment_mode,
      payment_date: form.payment_date,
      notes: form.notes.trim(),
    };

    createMutation.mutate({ projectId: form.project_id, payload });
  };

  const resetForm = () => {
    setForm({
      project_id: "",
      stage_id: "",
      expected_amount: "",
      amount: "",
      payment_mode: "",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const handleCancel = () => {
    setIsPanelOpen(false);
    resetForm();
  };

  const handleCreateStage = () => {
    if (newStageName.trim()) {
      createStageMutation.mutate({ name: newStageName.trim() });
    }
  };

  const handleDelete = (payment) => {
    setDeleteConfirmation(payment);
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;
    // Find the project ID for this payment
    const project = projects.find(p => p.name === deleteConfirmation.projectName);
    if (project) {
      deleteMutation.mutate({ projectId: project.id, paymentId: deleteConfirmation.id });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const stages = stagesData?.data || [];

  const exportHeaders = [
    { label: "Date", key: "payment_date", format: (v) => v ? new Date(v).toLocaleDateString() : "" },
    { label: "Project", key: "projectName" },
    { label: "Stage Name", key: "stage_name" },
    { label: "Amount", key: "amount" },
    { label: "Expected", key: "expected_amount" },
    { label: "GST", key: "gst_amount" },
    { label: "Mode", key: "payment_mode" },
    { label: "Notes", key: "notes" },
  ];

  const handleExportExcel = () => {
    downloadExcel(allPaymentsData || [], exportHeaders, "Payments", "payments.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded bg-white p-4 md:p-6 shadow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Payments</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage project payments
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 rounded border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition flex-1 sm:flex-auto"
            title="Export to Excel">
            <Download size={16} /> Excel
          </button>
          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="inline-flex items-center justify-center gap-1 rounded bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 px-4 py-2 text-sm font-medium text-white transition flex-[2] sm:flex-auto">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <section className="bg-white p-4 md:p-6 rounded shadow">
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold">All Payments</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            View all project payments
          </p>
        </div>

        {paymentsLoading ? (
          <p className="text-gray-500 text-center py-8">Loading payments...</p>
        ) : allPaymentsData && allPaymentsData.length > 0 ? (
          <Table
            filterable={true}
            excludeFilters={["actions", "receipt", "notes"]}
            columns={[
              { key: "projectName", label: "Project" },
              { key: "stage_name", label: "Stage Name" },
              { key: "gst_amount", label: "GST" },
              { key: "expected_amount", label: "Expected Amount" },
              { key: "amount", label: "Amount" },
              { key: "payment_mode", label: "Payment Mode" },
              { key: "payment_date", label: "Payment Date" },
              { key: "actions", label: "Actions" },
            ]}
            data={allPaymentsData.map((payment) => ({
              ...payment,
              gst_amount: payment.gst_amount ? formatIndianAmount(parseFloat(payment.gst_amount)) : "—",
              expected_amount: payment.expected_amount
                ? formatIndianAmount(parseFloat(payment.expected_amount))
                : "—",
              amount: formatIndianAmount(parseFloat(payment.amount)),
              actions: (
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(payment)}
                    className="rounded border border-gray-200 bg-white p-1.5 md:p-2 text-gray-600 transition hover:border-red-500 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            }))}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No payments found</p>
          </div>
        )}
      </section>

      <div className={`fixed inset-0 z-[100] flex md:items-center md:justify-end ${isPanelOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-out ${isPanelOpen ? "opacity-100" : "opacity-0"}`}
          onClick={handleCancel}
        />
        <div className={`relative w-full md:w-full md:max-w-md h-full md:h-auto md:rounded-lg flex flex-col overflow-y-auto bg-white p-4 md:p-6 shadow-xl md:mr-4 transition-transform duration-300 ease-out ${isPanelOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-[120%]"}`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">
                  Add Payment
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add payment details.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Project Name
                  <Select
                    name="project_id"
                    value={form.project_id}
                    onChange={handleChange}
                    className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Stage Name
                  <div className="flex gap-2">
                    <Select
                      name="stage_id"
                      value={form.stage_id}
                      onChange={handleChange}
                      className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 flex-1"
                      required
                    >
                      <option value="">Select Stage</option>
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      onClick={() => setShowCreateStage(true)}
                      className="rounded border border-gray-300 bg-white p-2 hover:bg-gray-50"
                      title="Add New Stage"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </label>
              </div>

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

              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="gst_applicable"
                    checked={!!form.gst_applicable}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-gray-700">GST applicable</span>
                </label>

                {form.gst_applicable && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="gst_percent"
                      value={form.gst_percent}
                      onChange={handleChange}
                      placeholder="GST %"
                      min="0"
                      step="0.01"
                      className="rounded border border-gray-300 px-3 py-2 text-sm w-32"
                    />
                    <div className="text-sm text-gray-700">GST Amount: <span className="font-semibold">{form.gst_amount ? form.gst_amount : "0.00"}</span></div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <Input
                  label="Payment Date"
                  type="date"
                  name="payment_date"
                  value={form.payment_date}
                  onChange={handleChange}
                  required
                />
              </div>

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
                  Failed to add payment. Please try again.
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
                  className="rounded bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isLoading ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>

      {/* Create Stage Modal */}
      {showCreateStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative rounded-lg bg-white p-4 md:p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Add New Stage
            </h3>
            <Input
              label="Stage name"
              type="text"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Stage name"
              className="mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateStage(false)}
                className="rounded border border-gray-300 bg-white px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateStage}
                disabled={createStageMutation.isLoading}
                className="rounded bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 px-3 md:px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createStageMutation.isLoading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
    </div>
  );
}