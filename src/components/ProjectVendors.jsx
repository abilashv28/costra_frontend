import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Link as LinkIcon } from "lucide-react/dist/esm/lucide-react.mjs";
import { getProjectVendors, assignVendorToProject, getVendors } from "../api/vendorApi";
import Table from "./common/Table";
import Select from "./common/Select";
import Input from "./common/Input";

export default function ProjectVendors({ projectId }) {
  const queryClient = useQueryClient();
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [notes, setNotes] = useState("");

  const { data: projectVendorsData, isLoading: isLoadingVendors } = useQuery({
    queryKey: ["projectVendors", projectId],
    queryFn: () => getProjectVendors(projectId),
    enabled: !!projectId,
  });

  const { data: globalVendorsData } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendors(),
  });

  const assignMutation = useMutation({
    mutationFn: (payload) => assignVendorToProject(payload.vendorId, projectId, payload.notes),
    onSuccess: () => {
      queryClient.invalidateQueries(["projectVendors", projectId]);
      setIsAssignOpen(false);
      setSelectedVendorId("");
      setNotes("");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to assign vendor");
    }
  });

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedVendorId) return;
    assignMutation.mutate({ vendorId: selectedVendorId, notes });
  };

  const projectVendors = projectVendorsData?.data || [];
  const globalVendors = globalVendorsData?.data || [];

  return (
    <section className="bg-white p-4 md:p-6 rounded shadow mt-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">Assigned Vendors</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Vendors working on this project
          </p>
        </div>
        <button
          onClick={() => setIsAssignOpen(true)}
          className="inline-flex items-center justify-center rounded bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-500 hover:via-cyan-400 hover:to-sky-600"
        >
          <LinkIcon size={16} className="mr-2" /> Assign Vendor
        </button>
      </div>

      {isLoadingVendors ? (
        <p className="text-gray-500 text-center py-8">Loading vendors...</p>
      ) : projectVendors.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded bg-gray-50">
          <p className="text-gray-500 mb-4">No Vendors assigned yet</p>
        </div>
      ) : (
        <Table
          filterable={false}
          columns={[
            { key: "name", label: "Name" },
            { key: "service_type", label: "Service Type" },
            { key: "phone", label: "Contact" },
            { key: "ProjectVendor.notes", label: "Notes" },
          ]}
          data={projectVendors.map(v => ({
            ...v,
            'ProjectVendor.notes': v.ProjectVendor?.notes || "—"
          }))}
        />
      )}

      {/* Assign Modal */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsAssignOpen(false)} />
          <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Assign Vendor</h3>
            <form onSubmit={handleAssign} className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Select Vendor (Global Directory)
                <Select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="">-- Choose a vendor --</option>
                  {globalVendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.location || 'No Loc.'} - {v.service_type || 'General'})
                    </option>
                  ))}
                </Select>
              </label>
              
              <Input
                label="Assignment Notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Plumbing for block A"
              />

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAssignOpen(false)} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={assignMutation.isPending} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                  {assignMutation.isPending ? "Assigning..." : "Assign Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
