import api from "./axios";

export const getVendors = (params) => api.get("/vendors", { params });
export const createVendor = (data) => api.post("/vendors", data);
export const updateVendor = (id, data) => api.put(`/vendors/${id}`, data);
export const deleteVendor = (id) => api.delete(`/vendors/${id}`);
export const assignVendorToProject = (id, projectId, notes) => api.post(`/vendors/${id}/assign-project`, { project_id: projectId, notes });
export const getProjectVendors = (projectId) => api.get(`/vendors/project/${projectId}`);
