import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Trash2, Plus, Download } from "lucide-react/dist/esm/lucide-react.mjs";
import { getVendors, createVendor, updateVendor, deleteVendor } from "../api/vendorApi";
import Input from "../components/common/Input";
import Table from "../components/common/Table";
import LocationPicker from "../components/common/LocationPicker";
import { downloadExcel } from "../utils/exportUtils";

export default function Vendors() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    area: "",
    location: "",
    latitude: "",
    longitude: "",
    service_type: "",
    gst_number: "",
    address: "",
  });

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendors(),
  });

  const createMutation = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries(["vendors"]);
      setIsPanelOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["vendors"]);
      setIsPanelOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries(["vendors"]);
      setDeleteConfirmation(null);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to delete vendor");
    }
  });

  const resetForm = () => {
    setForm({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      country: "",
      state: "",
      city: "",
      area: "",
      location: "",
      latitude: "",
      longitude: "",
      service_type: "",
      gst_number: "",
      address: "",
    });
    setEditingVendorId(null);
  };

  const handleCancel = () => {
    setIsPanelOpen(false);
    resetForm();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingVendorId) {
      updateMutation.mutate({ id: editingVendorId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendorId(vendor.id);
    setForm({
      name: vendor.name || "",
      contact_person: vendor.contact_person || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      country: vendor.country || "",
      state: vendor.state || "",
      city: vendor.city || "",
      area: vendor.area || "",
      location: vendor.location || "",
      latitude: vendor.latitude || "",
      longitude: vendor.longitude || "",
      service_type: vendor.service_type || "",
      gst_number: vendor.gst_number || "",
      address: vendor.address || "",
    });
    setIsPanelOpen(true);
  };

  const handleDelete = (vendor) => {
    setDeleteConfirmation(vendor);
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteMutation.mutate(deleteConfirmation.id);
    }
  };

  const filteredVendors = useMemo(() => {
    return vendorsData?.data?.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.city && v.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.area && v.area.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.service_type && v.service_type.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];
  }, [vendorsData, searchQuery]);

  const exportHeaders = [
    { label: "Name", key: "name" },
    { label: "Contact Person", key: "contact_person" },
    { label: "Country", key: "country" },
    { label: "State", key: "state" },
    { label: "City", key: "city" },
    { label: "Area", key: "area" },
    { label: "Service Type", key: "service_type" },
    { label: "Phone", key: "phone" },
    { label: "GST Number", key: "gst_number" },
  ];

  const handleExportExcel = () => downloadExcel(filteredVendors, exportHeaders, "Vendors", "vendors.xlsx");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded bg-white p-4 md:p-6 shadow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Vendors</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Manage your global directory of vendors</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button onClick={handleExportExcel} className="inline-flex items-center justify-center gap-2 rounded border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition flex-1 sm:flex-auto" title="Export to Excel"><Download size={16}/> Excel</button>
          <button onClick={() => setIsPanelOpen(true)} className="inline-flex items-center justify-center rounded bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-500 hover:via-cyan-400 hover:to-sky-600 flex-[2] sm:flex-auto"><Plus size={16} className="mr-1"/> Add Vendor</button>
        </div>
      </div>

      <section className="bg-white p-4 md:p-6 rounded shadow">
        <div className="mb-4">
          <Input label="Search by Name, City, Area, or Service Type" type="text" placeholder="Enter search term..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Loading vendors...</p>
        ) : filteredVendors.length > 0 ? (
          <Table
            filterable={true}
            excludeFilters={["actions"]}
            columns={[
              { key: "name", label: "Name" },
              { key: "city", label: "City" },
              { key: "area", label: "Area" },
              { key: "service_type", label: "Service Type" },
              { key: "contact_person", label: "Contact Person" },
              { key: "phone", label: "Phone" },
              { key: "actions", label: "Actions" },
            ]}
            data={filteredVendors}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No vendors found.</p>
          </div>
        )}
      </section>

      {/* Side Panel */}
      <div className={`fixed inset-0 z-[100] flex md:items-center md:justify-end ${isPanelOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${isPanelOpen ? "opacity-100" : "opacity-0"}`} onClick={handleCancel} />
        
        <div className={`relative flex h-full w-full flex-col bg-slate-50 shadow-2xl transition-transform duration-300 md:h-auto md:max-h-[90vh] md:w-[600px] md:rounded-l-2xl ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 md:rounded-tl-2xl">
            <h2 className="text-xl md:text-2xl font-semibold">{editingVendorId ? "Edit Vendor" : "New Vendor"}</h2>
            <button onClick={handleCancel} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition">
              <Plus size={24} className="rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form id="vendor-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" type="text" name="name" value={form.name} onChange={handleChange} required />
                <Input label="Service Type" type="text" name="service_type" value={form.service_type} onChange={handleChange} placeholder="e.g., Plumbing" />
                <Input label="Contact Person" type="text" name="contact_person" value={form.contact_person} onChange={handleChange} />
                <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} />
                <Input label="Phone" type="text" name="phone" value={form.phone} onChange={handleChange} />
                <Input label="GST Number" type="text" name="gst_number" value={form.gst_number} onChange={handleChange} />
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Location Details</h3>
                <LocationPicker 
                  value={{
                    country: form.country,
                    state: form.state,
                    city: form.city,
                    area: form.area,
                    latitude: form.latitude,
                    longitude: form.longitude
                  }} 
                  onChange={(locationData) => setForm({ ...form, ...locationData, location: locationData.city || locationData.area || "" })} 
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows="3" className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-200 bg-white px-6 py-4 md:rounded-bl-2xl flex items-center justify-end gap-3">
            <button type="button" onClick={handleCancel} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" form="vendor-form" disabled={createMutation.isPending || updateMutation.isPending} className="rounded bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition">
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingVendorId ? "Save Changes" : "Create Vendor"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setDeleteConfirmation(null)} />
          <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 z-10">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Vendor</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete "{deleteConfirmation.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmation(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
