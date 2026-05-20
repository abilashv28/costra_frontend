import api from "./axios";

export const getProjects = () => api.get("/projects");
export const createProject = (data) =>
  api.post("/projects", data, {
    toastMessage: "Project created successfully!",
  });
export const updateProject = (id, data) =>
  api.put(`/projects/${id}`, data, {
    toastMessage: "Project updated successfully!",
  });
export const deleteProject = (id) => api.delete(`/projects/${id}`);