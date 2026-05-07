import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      localStorage.removeItem("token");
      window.location.href = "/"; // Redirect to login
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: (userData) => API.post("/auth/register", userData),
  login: (credentials) => API.post("/auth/login", credentials),
  getProfile: () => API.get("/auth/profile"),
};

// Transaction API calls
export const transactionAPI = {
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.type) params.append('type', filters.type);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    return API.get(`/api/transactions?${params.toString()}`);
  },
  getTransactionSummary: (period = 'month') => API.get(`/api/transactions/summary?period=${period}`),
  createTransaction: (data) => API.post('/api/transactions', data),
  getTransaction: (id) => API.get(`/api/transactions/${id}`),
  updateTransaction: (id, data) => API.put(`/api/transactions/${id}`, data),
  deleteTransaction: (id) => API.delete(`/api/transactions/${id}`),
};

// Category API calls
export const categoryAPI = {
  getCategories: (type = null) => {
    const params = type ? `?type=${type}` : '';
    return API.get(`/api/categories${params}`);
  },
  createCategory: (data) => API.post('/api/categories', data),
  updateCategory: (id, data) => API.put(`/api/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/api/categories/${id}`),
};

// Budget API calls
export const budgetAPI = {
  getBudgets: () => API.get('/api/budgets'),
  createBudget: (data) => API.post('/api/budgets', data),
  getBudget: (id) => API.get(`/api/budgets/${id}`),
  updateBudget: (id, data) => API.put(`/api/budgets/${id}`, data),
  deleteBudget: (id) => API.delete(`/api/budgets/${id}`),
  getBudgetProgress: (id = null) => {
    const endpoint = id ? `/api/budgets/${id}/progress` : '/api/budgets/progress';
    return API.get(endpoint);
  },
  getBudgetAlerts: () => API.get('/api/budgets/alerts'),
};

// Chat API calls
export const chatAPI = {
  sendMessage: (data) => API.post('/api/chat', data),
  getChatHistory: (limit = 50, offset = 0) => API.get(`/api/chat?limit=${limit}&offset=${offset}`),
  getChatMessage: (id) => API.get(`/api/chat/${id}`),
  deleteChatMessage: (id) => API.delete(`/api/chat/${id}`),
  getChatStats: () => API.get('/api/chat/stats'),
  clearChatHistory: () => API.delete('/api/chat/history'),
};

// Summary API call
export const getSummary = (period = 'month') => API.get(`/summary?period=${period}`);

// Legacy API calls (keeping for backward compatibility)
export const sendMessage = (data) => API.post("/chat", data);