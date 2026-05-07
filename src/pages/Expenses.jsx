import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Trash2, Download } from "lucide-react/dist/esm/lucide-react.mjs";
import { createExpense, getExpenses, updateExpense, deleteExpense } from "../api/expenseApi";
import { getCategories, createCategory } from "../api/categoryApi";
import { getProjects } from "../api/projectApi";
import { getPresignedUrl, uploadToS3, getFileUrl } from "../api/attachmentApi";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Table from "../components/common/Table";
import useDateFormatter from "../hooks/useDateFormatter";

export default function Expenses() {
  const queryClient = useQueryClient();
  const { formatDate } = useDateFormatter();
  const [form, setForm] = useState({
    project_id: "",
    category_id: "",
    amount: "",
    expense_date: "",
    notes: "",
    file_url: ""
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: newCategory => {
      queryClient.invalidateQueries(["categories"]);
      setForm(prev => ({ ...prev, category_id: newCategory.id.toString() }));
      setShowCreateCategory(false);
      setNewCategoryName("");
    }
  });

  const mutation = useMutation({
    mutationFn: payload => {
      if (editingExpenseId) {
        return updateExpense(editingExpenseId, payload);
      }
      return createExpense(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      setForm({
        project_id: "",
        category_id: "",
        amount: "",
        expense_date: "",
        notes: "",
        file_url: ""
      });
      setIsPanelOpen(false);
      setEditingExpenseId(null);
      setSelectedFile(null);
    }
  });

  const handleChange = event => {
    const { name, value } = event.target;

    if (name === "category_id" && value === "create") {
      setShowCreateCategory(true);
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please select a valid file (JPG, PNG, or PDF)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setUploadError("");
  };

  const uploadFile = async file => {
    try {
      setIsUploading(true);
      setUploadError("");

      const fileExtension = file.name.split(".").pop();
      const key = `expenses/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

      // Get pre-signed URL
      const presignedResponse = await getPresignedUrl(key, file.type);
      const { signedUrl } = presignedResponse.data;

      // Upload file to S3
      await uploadToS3(signedUrl, file);

      // Get permanent file URL
      const fileUrlResponse = await getFileUrl(key);
      const { fileUrl } = fileUrlResponse.data;

      setForm(prev => ({ ...prev, file_url: fileUrl }));
      setSelectedFile(null);
      return fileUrl;
    } catch (error) {
      setUploadError("Failed to upload file. Please try again.");
      console.error("File upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCategory = event => {
    event.preventDefault();
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate({ name: newCategoryName.trim() });
    }
  };

  const cancelCreateCategory = () => {
    setShowCreateCategory(false);
    setNewCategoryName("");
  };

  const handleSubmit = async event => {
    event.preventDefault();

    let fileUrl = form.file_url || null;

    // If file is selected, upload it first
    if (selectedFile) {
      try {
        fileUrl = await uploadFile(selectedFile);
      } catch {
        return;
      }
    }

    const payload = {
      project_id: Number(form.project_id),
      category_id: Number(form.category_id),
      amount: Number(form.amount),
      expense_date: form.expense_date,
      notes: form.notes.trim(),
      file_url: fileUrl
    };

    mutation.mutate(payload);
  };

  const columns = [
    { key: "amount", label: "Amount" },
    { key: "expense_date", label: "Date" },
    { key: "project_name", label: "Project" },
    { key: "category_name", label: "Category" },
    { key: "notes", label: "Notes" },
    { key: "file", label: "File" },
    { key: "actions", label: "Actions" }
  ];

  const handleCancel = () => {
    setIsPanelOpen(false);
    setForm({
      project_id: "",
      category_id: "",
      amount: "",
      expense_date: "",
      notes: "",
      file_url: ""
    });
    setEditingExpenseId(null);
    setSelectedFile(null);
    setUploadError("");
  };

  const handleEdit = expense => {
    setForm({
      project_id: expense.project_id,
      category_id: expense.category_id,
      amount: expense.amount,
      expense_date: expense.expense_date,
      notes: expense.notes,
      file_url: expense.file_url || ""
    });
    setEditingExpenseId(expense.id);
    setIsPanelOpen(true);
  };

  const handleDelete = expense => {
    setDeleteConfirmation(expense);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await deleteExpense(deleteConfirmation.id);
      queryClient.invalidateQueries(["expenses"]);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  if (isLoading) return <p>Loading...</p>;

  const filteredExpenses = data?.data?.filter(expense => (expense.Project?.name || "").toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded bg-white p-4 md:p-6 shadow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Expenses</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Track all your project expenses</p>
        </div>
        <button
          type="button"
          onClick={() => setIsPanelOpen(true)}
          className="inline-flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition w-full sm:w-auto">
          Create Expense
        </button>
      </div>

      <section className="bg-white p-4 md:p-6 rounded shadow">
        <div className="mb-4">
          <Input
            label="Search by Project"
            type="text"
            placeholder="Enter project name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <h2 className="text-lg md:text-xl font-semibold mb-4">Expense List</h2>
        <Table
          columns={columns}
          data={
            filteredExpenses.map(expense => ({
              ...expense,
              amount: `₹${expense.amount}`,
              expense_date: formatDate(expense.expense_date),
              project_name: expense.Project?.name || "N/A",
              category_name: expense.Category?.name || "N/A",
              file: expense.file_url ? (
                <a
                  href={expense.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                  title="Download">
                  <Download size={16} />
                  <span className="text-sm">Download</span>
                </a>
              ) : (
                <span className="text-gray-400 text-sm">No file</span>
              ),
              actions: (
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(expense)}
                    className="rounded border border-gray-200 bg-white p-1.5 md:p-2 text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
                    title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(expense)}
                    className="rounded border border-gray-200 bg-white p-1.5 md:p-2 text-gray-600 transition hover:border-red-500 hover:text-red-600"
                    title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })) || []
          }
        />
      </section>

      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex md:items-center md:justify-end">
          <button type="button" onClick={handleCancel} className="absolute inset-0 bg-black/40 md:hidden" />
          <div className="relative w-full md:w-full md:max-w-md h-full md:h-auto md:rounded-lg flex flex-col overflow-y-auto bg-white p-4 md:p-6 shadow-xl md:mr-4">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">{editingExpenseId ? "Edit Expense" : "New Expense"}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingExpenseId ? "Update expense details and save." : "Add expense details and save."}
                </p>
              </div>
              <button type="button" onClick={handleCancel} className="text-gray-500 hover:text-gray-700 font-semibold">
                ✕
              </button>
            </div>

            <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
              <Input
                label="Amount"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />

              <Input
                label="Expense Date"
                type="date"
                name="expense_date"
                value={form.expense_date}
                onChange={handleChange}
                required
              />

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Project
                <Select
                  name="project_id"
                  value={form.project_id}
                  onChange={handleChange}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                  required>
                  <option value="">Select a project</option>
                  {projectsData?.data?.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Category
                <Select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                  required>
                  <option value="">Select a category</option>
                  <option value="create" className="font-medium text-blue-600">
                    ➕ Create a category
                  </option>
                  {categoriesData?.data?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                  rows="3"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Attachment (Image or PDF)
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {selectedFile && <p className="text-xs text-blue-600">Selected: {selectedFile.name}</p>}
                {form.file_url && !selectedFile && <p className="text-xs text-green-600">File already attached</p>}
              </label>

              {uploadError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{uploadError}</p>}

              {mutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  Failed to {editingExpenseId ? "update" : "create"} expense. Please try again.
                </p>
              )}
              {mutation.isSuccess && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded">Expense {editingExpenseId ? "updated" : "created"} successfully.</p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isUploading || mutation.isLoading}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isLoading || isUploading}
                  className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isUploading ? "Uploading..." : mutation.isLoading ? "Saving..." : editingExpenseId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" onClick={cancelDelete} className="absolute inset-0 bg-black/40" />
          <div className="relative rounded-lg bg-white p-4 md:p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Are you sure you want to delete this expense (₹{deleteConfirmation.amount})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 flex-wrap">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded border border-gray-300 bg-white px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded bg-red-600 hover:bg-red-700 px-3 md:px-4 py-2 text-sm font-medium text-white transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" onClick={cancelCreateCategory} className="absolute inset-0 bg-black/40" />
          <div className="relative rounded-lg bg-white p-4 md:p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Create New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <Input
                label="Category Name"
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
              />
              {createCategoryMutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">Failed to create category. Please try again.</p>
              )}
              <div className="flex items-center justify-end gap-3 flex-wrap pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={cancelCreateCategory}
                  className="rounded border border-gray-300 bg-white px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isLoading}
                  className="rounded bg-blue-600 hover:bg-blue-700 px-3 md:px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {createCategoryMutation.isLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
