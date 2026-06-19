import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserPlus } from "lucide-react/dist/esm/lucide-react.mjs";
import { getUsers, createUser, deleteUser } from "../api/userApi";
import useAuthStore from "../stores/authStore";
import Input from "../components/common/Input";
import Table from "../components/common/Table";

export default function Users() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [form, setForm] = useState({
    email: "",
    role: "user",
    company_id: currentUser?.company_id || "",
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setForm({
        email: "",
        role: "user",
        company_id: currentUser?.company_id || "",
      });
      setIsPanelOpen(false);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  const handleCancel = () => {
    setIsPanelOpen(false);
    setForm({
      email: "",
      role: "user",
      company_id: currentUser?.company_id || "",
    });
  };

  const handleDelete = (user) => {
    setDeleteConfirmation(user);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await deleteUser(deleteConfirmation.id);
      queryClient.invalidateQueries(["users"]);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  if (isLoading) return <p>Loading...</p>;

  const users = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data)
    ? data
    : [];

  const filteredUsers = users.filter((user) =>
    (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded bg-white p-4 md:p-6 shadow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Users</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Manage system users</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm((prev) => ({
              ...prev,
              name: "",
              email: "",
              password: "",
              role: "user",
              company_id: currentUser?.company_id || prev.company_id,
            }));
            setIsPanelOpen(true);
          }}
          className="inline-flex items-center justify-center rounded bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 px-4 py-2 text-sm font-medium text-white shadow-sm transition w-full sm:w-auto gap-2">
          <UserPlus size={16} />
          Create User
        </button>
      </div>

      <section className="bg-white p-4 md:p-6 rounded shadow">
        <div className="mb-4">
          <Input
            label="Search by Name or Email"
            type="text"
            placeholder="Enter name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <h2 className="text-lg md:text-xl font-semibold mb-4">Users List</h2>
        <Table
          filterable={true}
          excludeFilters={["actions"]}
          columns={columns}
          data={
            filteredUsers.map((user) => ({
              ...user,
              actions: (
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(user)}
                    className="rounded border border-gray-200 bg-white p-1.5 md:p-2 text-gray-600 transition hover:border-red-500 hover:text-red-600"
                    title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            })) || []
          }
        />
      </section>

      <div className={`fixed inset-0 z-[100] flex md:items-center md:justify-end ${isPanelOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-out ${isPanelOpen ? "opacity-100" : "opacity-0"}`}
          onClick={handleCancel}
        />
        <div className={`relative w-full md:w-full md:max-w-md h-full md:h-auto md:rounded-lg flex flex-col overflow-y-auto bg-white p-4 md:p-6 shadow-xl md:mr-4 transition-transform duration-300 ease-out ${isPanelOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-[120%]"}`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">New User</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add user details and save.
                </p>
              </div>
              <span onClick={handleCancel} className="text-gray-500 hover:text-gray-700 font-semibold cursor-pointer transition text-sm md:text-base">
                ✕
              </span>
            </div>

            <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              {mutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  Failed to create user. Please try again.
                </p>
              )}
              {mutation.isSuccess && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded">
                  User created successfully.
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={mutation.isLoading}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isLoading}
                  className="rounded bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {mutation.isLoading ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>

      {deleteConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={cancelDelete} />
          <div className="relative rounded-lg bg-white p-4 md:p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Are you sure you want to delete user "{deleteConfirmation.name}"? This action cannot be undone.
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
    </div>
  );
}