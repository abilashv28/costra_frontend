import { useState } from "react";
import { chatAPI } from "../services/api";
import { motion } from "framer-motion";

export default function ChatBox({ onNewTransaction, categories = [] }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setResponse("");

      const res = await chatAPI.sendMessage({
        message: message.trim(),
      });

      // Show AI response
      setResponse(res.data.response);

      // If transaction was created, add it to the list
      if (res.data.parsed && res.data.parsed.amount) {
        // Create a transaction object for the frontend
        const transaction = {
          id: Date.now(), // Temporary ID until refresh
          amount: res.data.parsed.amount,
          type: res.data.parsed.type || "expense",
          category_id: res.data.parsed.category_id,
          note: res.data.parsed.note || message,
          transaction_date: new Date().toISOString().split('T')[0],
          Category: categories.find(c => c.id === res.data.parsed.category_id),
        };

        onNewTransaction(transaction);
      }

      setMessage("");
    } catch (err) {
      console.error("Error:", err);
      setResponse("Sorry, I couldn't process that expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-lg rounded-2xl p-4 mb-6"
    >
      <div className="flex gap-2">
        <input
          className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="💬 Enter expense (e.g., 'Spent 200 on food' or 'Earned 5000 salary')"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="px-6 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
        >
          <p className="text-gray-700">{response}</p>
        </motion.div>
      )}

      {loading && (
        <div className="mt-3 flex items-center text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Processing your expense...
        </div>
      )}
    </motion.div>
  );
}