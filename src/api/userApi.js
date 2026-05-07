import api from "./axios";
import useAuthStore from "../stores/authStore";

export const getUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (userData) => {
  const state = useAuthStore.getState();
  const token = state.token;
  return api.post("/users", userData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
};
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);