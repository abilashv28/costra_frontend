import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SummaryChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-lg rounded-2xl p-4 mt-6"
      >
        <h2 className="text-lg font-semibold mb-3">Spending Breakdown</h2>
        <div className="text-center py-8 text-gray-500">
          No spending data to display yet
        </div>
      </motion.div>
    );
  }

  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ];

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: colors.slice(0, Object.keys(data).length),
        hoverBackgroundColor: colors.slice(0, Object.keys(data).length),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.parsed.toFixed(2)}`;
          }
        }
      }
    },
  };

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-lg rounded-2xl p-4 mt-6"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Spending Breakdown</h2>
        <span className="text-sm text-gray-600">Total: ${total.toFixed(2)}</span>
      </div>
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
    </motion.div>
  );
}