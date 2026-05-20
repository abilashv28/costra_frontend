import api from "./axios";

export const getExpenses = () => api.get("/expenses");
export const createExpense = (data) =>
  api.post("/expenses", data, {
    toastMessage: "Expense created successfully!",
  });
export const updateExpense = (id, data) =>
  api.put(`/expenses/${id}`, data, {
    toastMessage: "Expense updated successfully!",
  });
export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`, {
    toastMessage: "Expense deleted successfully!",
  });