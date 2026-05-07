import api from "./axios";

export const getPaymentStages = () => api.get("/payment-stages");
export const createPaymentStage = (data) => api.post("/payment-stages", data);