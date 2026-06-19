import api from "./axios";

export const getAuditLogs = (params = {}) => {
  return api.get("/audit-logs", { params });
};
