import axios from "./axios";

export const createProjectPayment = (projectId, paymentData) => {
  return axios.post(`/projects/${projectId}/payments`, paymentData);
};

export const getProjectPayments = (projectId) => {
  return axios.get(`/projects/${projectId}/payments`);
};

export const getProjectPaymentById = (projectId, paymentId) => {
  return axios.get(`/projects/${projectId}/payments/${paymentId}`);
};

export const updateProjectPayment = (projectId, paymentId, paymentData) => {
  return axios.put(`/projects/${projectId}/payments/${paymentId}`, paymentData);
};

export const deleteProjectPayment = (projectId, paymentId) => {
  return axios.delete(`/projects/${projectId}/payments/${paymentId}`);
};
