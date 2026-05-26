import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Eye, Edit3, Trash2 } from "lucide-react/dist/esm/lucide-react.mjs";

import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../api/projectApi";

import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Table from "../components/common/Table";
import formatIndianAmount from "../utils/formatAmount";

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

  const [editingProjectId, setEditingProjectId] =
    useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [deleteConfirmation, setDeleteConfirmation] =
    useState(null);

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
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setForm({
        client_name: "",
        budget: "",
        location: "",
        projecttype: "",
      });

      setEditingProjectId(null);
      setIsPanelOpen(false);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setEditingProjectId(null);

    setForm({
      client_name: "",
      budget: "",
      location: "",
      projecttype: "",
    });
  };

  const handleView = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (project) => {
    setForm({
      client_name: project.client_name || "",
      budget: project.budget || "",
      location: project.location || "",
      projecttype: project.projecttype || "",
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

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const filteredProjects =
    data?.data?.filter((project) =>
      project.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">
            Projects
          </h1>

          <p className="mt-1 text-xs text-gray-500 md:text-sm">
            Manage all your projects
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProjectId(null);

            setForm({
              client_name: "",
              budget: "",
              location: "",
              projecttype: "",
            });

            setIsPanelOpen(true);
          }}
          className="inline-flex w-full items-center justify-center rounded bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-500 hover:via-cyan-400 hover:to-sky-600 sm:w-auto"
        >
          Create Project
        </button>
      </div>

      {/* Table Section */}
      <section className="rounded bg-white p-4 shadow md:p-6">
        <div className="mb-4">
          <Input
            label="Search by Project Name"
            type="text"
            placeholder="Enter project name..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>

        <h2 className="mb-4 text-lg font-semibold md:text-xl">
          Project List
        </h2>

        <Table
          columns={columns}
          data={filteredProjects.map((project) => ({
            ...project,
            budget: formatIndianAmount(project.budget),
            actions: (
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
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
          }))}
        />
      </section>

      {/* Delete Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl md:p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 md:text-xl">
              Confirm Delete
            </h3>

            <p className="mb-6 text-sm text-gray-600 md:text-base">
              Are you sure you want to delete "
              {deleteConfirmation.name}"?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex md:items-center md:justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={handleCancel}
          />

          {/* Drawer */}
          <div className="relative flex h-full w-full flex-col overflow-y-auto bg-white p-4 shadow-xl md:mr-4 md:h-auto md:max-w-md md:rounded-lg md:p-6">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold md:text-2xl">
                  {editingProjectId
                    ? "Edit Project"
                    : "New Project"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingProjectId
                    ? "Update project details and save."
                    : "Add project details and save."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="text-sm font-semibold text-gray-500 transition hover:text-gray-700 md:text-base"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              className="flex-1 space-y-4"
              onSubmit={handleSubmit}
            >
              {/* Generated Name */}
              <div className="rounded border bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-700 md:text-sm">
                  Generated Project Name
                </p>

                <p className="mt-1 text-base font-semibold text-gray-900 md:text-lg">
                  {form.client_name &&
                  form.location
                    ? `${form.client_name.trim()}.${form.location.trim()}`
                    : "Enter client name and location"}
                </p>
              </div>

              {/* Project Type */}
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Project Type

                <Select
                  name="projecttype"
                  value={form.projecttype}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="">
                    Select Project Type
                  </option>

                  <option value="building_construction">
                    Building Construction
                  </option>

                  <option value="interior">
                    Interior
                  </option>
                </Select>
              </label>

              {/* Client Name */}
              <Input
                label="Client Name"
                type="text"
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                required
              />

              {/* Location */}
              <Input
                label="Location"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
              />

              {/* Budget */}
              <Input
                label="Budget"
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                min="0"
                required
              />

              {/* Error */}
              {mutation.isError && (
                <p className="rounded bg-red-50 p-3 text-sm text-red-600">
                  Failed to{" "}
                  {editingProjectId
                    ? "update"
                    : "create"}{" "}
                  project.
                </p>
              )}

              {/* Footer */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {mutation.isPending
                    ? "Saving..."
                    : editingProjectId
                    ? "Update"
                    : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}