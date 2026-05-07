import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { transactionAPI, categoryAPI, chatAPI } from "../services/api";
import ChatBox from "../components/ChatBox";
import TransactionList from "../components/TransactionList";
import SummaryChart from "../components/SummaryChart";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch transactions and categories in parallel
      const [transactionsResponse, categoriesResponse] = await Promise.all([
        transactionAPI.getTransactions(),
        categoryAPI.getCategories()
      ]);

      setTransactions(transactionsResponse.data.data || []);
      setCategories(categoriesResponse.data.data || []);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = (tx) => {
    // Add to local state immediately for better UX
    setTransactions((prev) => [tx, ...prev]);
  };

  const updateTransaction = async (id, updatedData) => {
    try {
      await transactionAPI.updateTransaction(id, updatedData);
      // Update local state
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updatedData } : tx))
      );
    } catch (error) {
      console.error("Failed to update transaction:", error);
      // Revert optimistic update if API call fails
      fetchInitialData();
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionAPI.deleteTransaction(id);
      // Remove from local state
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      // Revert optimistic update if API call fails
      fetchInitialData();
    }
  };

  const summary = transactions.reduce((acc, t) => {
    if (!t || t.category_id == null || t.amount == null) return acc;

    // Find category name
    const category = categories.find(c => c.id === t.category_id);
    const categoryName = category ? category.name : "Uncategorized";

    if (t.type === "expense") {
      acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={fetchInitialData}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          💰 Expense AI Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, {user?.name}!</span>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <ChatBox
        onNewTransaction={addTransaction}
        categories={categories}
      />

      <SummaryChart data={summary} />

      <TransactionList
        transactions={transactions}
        categories={categories}
        onUpdateTransaction={updateTransaction}
        onDeleteTransaction={deleteTransaction}
      />
    </div>
  );
}