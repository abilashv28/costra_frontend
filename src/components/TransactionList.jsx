import { useState } from "react";
import { motion } from "framer-motion";

export default function TransactionList({ transactions, categories = [], onUpdateTransaction, onDeleteTransaction }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const startEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      amount: transaction.amount,
      category_id: transaction.category_id,
      note: transaction.note || "",
      type: transaction.type,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (onUpdateTransaction) {
      await onUpdateTransaction(editingId, editForm);
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      if (onDeleteTransaction) {
        await onDeleteTransaction(id);
      }
    }
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-lg rounded-2xl p-4 mt-6"
    >
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>

      {transactions.length === 0 && (
        <p className="text-gray-500 text-center py-8">No transactions yet. Start by chatting with the AI above!</p>
      )}

      <div className="space-y-2">
        {transactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            {editingId === transaction.id ? (
              // Edit mode
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="p-2 border rounded"
                  />
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({...editForm, category_id: e.target.value})}
                    className="p-2 border rounded"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Note"
                  value={editForm.note}
                  onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getCategoryName(transaction.category_id)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      transaction.type === "income"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {transaction.type}
                    </span>
                  </div>
                  {transaction.note && (
                    <p className="text-sm text-gray-600 mt-1">{transaction.note}</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(transaction.transaction_date)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "income" ? `+$${transaction.amount}` : `-$${transaction.amount}`}
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(transaction)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}