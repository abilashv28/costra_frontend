import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Edit3, Trash2 } from "lucide-react/dist/esm/lucide-react.mjs";
import { createProject, getProjects, updateProject, deleteProject } from "../api/projectApi";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Table from "../components/common/Table";

export default function Projects() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    client_name: "",
    budget: "",
    location: "",
    projecttype: "",
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);


  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (editingProjectId) {
        return updateProject(editingProjectId, payload);
      }
      return createProject(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      setForm({ client_name: "", budget: "", location: "", projecttype: "" });
      setIsPanelOpen(false);
      setEditingProjectId(null);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const projectName = `${form.client_name.trim()}.${form.location.trim()}`;

    const payload = {
      name: projectName,
      client_name: form.client_name.trim(),
      budget: Number(form.budget),
      location: form.location.trim(),
      projecttype: form.projecttype,
    };

    mutation.mutate(payload);
  };

  const columns = [
    { key: "name", label: "Project Name" },
    { key: "client_name", label: "Client Name" },
    { key: "projecttype", label: "Project Type" },
    { key: "budget", label: "Budget" },
    { key: "location", label: "Location" },
    { key: "actions", label: "Actions" },
  ];

  const handleCancel = () => {
    setIsPanelOpen(false);
    setForm({ client_name: "", budget: "", location: "", projecttype: "" });
    setEditingProjectId(null);
  };

  const handleView = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (project) => {
    setForm({
      client_name: project.client_name,
      budget: project.budget,
      location: project.location,
      projecttype: project.projecttype,
    });
    setEditingProjectId(project.id);
    setIsPanelOpen(true);
  };

  const handleDelete = (project) => {
    setDeleteConfirmation(project);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await deleteProject(deleteConfirmation.id);
      queryClient.invalidateQueries(["projects"]);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  if (isLoading) return <p>Loading...</p>;

  const filteredProjects = data?.data?.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded bg-white p-4 md:p-6 shadow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Projects</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Manage all your projects</p>
        </div>
        <button
          type="button"
          onClick={() => setIsPanelOpen(true)}
          className="inline-flex items-center justify-center rounded bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 text-white shadow-sm hover:from-blue-500 hover:via-cyan-400 hover:to-sky-600 px-4 py-2 text-sm font-medium transition w-full sm:w-auto"
        >
          Create Project
        </button>
      </div>

      <section className="bg-white p-4 md:p-6 rounded shadow">
        <div className="mb-4">
          <Input
            label="Search by Project Name"
            type="text"
            placeholder="Enter project name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <h2 className="text-lg md:text-xl font-semibold mb-4">Project List</h2>
        <Table
          columns={columns}
          data={
            filteredProjects.map((project) => ({
              ...project,
              actions: (
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    type="button"
                    onClick={() => handleView(project)}
                    className="rounded border border-gray-200 bg-white p-1.5 md:p-2 text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(project)}
                    className="rounded border border-gray-200 bg-white p-1.5 md:p-2 text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project)}
                    className="rounded border border-gray-200 bg-white p-1.5 md:p-2 text-gray-600 transition hover:border-red-500 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            })) || []
          }
        />
      </section>

      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative rounded-lg bg-white p-4 md:p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirmation.name}"? This action cannot be undone.
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
                className="rounded bg-red-600 hover:bg-red-700 px-3 md:px-4 py-2 text-sm font-medium text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex md:items-center md:justify-end">
          <div className="relative w-full md:w-full md:max-w-md h-full md:h-auto md:rounded-lg flex flex-col overflow-y-auto bg-white p-4 md:p-6 shadow-xl md:mr-4">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">
                  {editingProjectId ? "Edit Project" : "New Project"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingProjectId ? "Update project details and save." : "Add project details and save."}
                </p>
              </div>
              <span

                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 font-semibold cursor-pointer transition text-sm md:text-base"
              >
                X
              </span>
            </div>

            <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-xs md:text-sm font-medium text-gray-700">Generated Project Name</p>
                <p className="text-base md:text-lg font-semibold text-gray-900 mt-1">
                  {form.client_name && form.location ? `${form.client_name.trim()}.${form.location.trim()}` : "Enter client name and location"}
                </p>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Project Type
                <Select
                  name="projecttype"
                  value={form.projecttype}
                  onChange={handleChange}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                  required
                >
                  <option value="">Select Project Type</option>
                  <option value="building_construction">Building Construction</option>
                  <option value="interior">Interior</option>
                </Select>
              </label>

              <Input
                label="Client Name"
                type="text"
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                required
              />

              <Input
                label="Location"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
              />

              <Input
                label="Budget"
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                min="0"
                required
              />

              {mutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  Failed to {editingProjectId ? "update" : "create"} project. Please try again.
                </p>
              )}
              {mutation.isSuccess && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded">
                  Project {editingProjectId ? "updated" : "created"} successfully.
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
                  disabled={mutation.isLoading}
                  className="rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isLoading ? "Saving..." : editingProjectId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
