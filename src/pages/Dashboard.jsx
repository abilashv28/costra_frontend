import { useQuery, useQueries } from "@tanstack/react-query";
import { useState } from "react";
import useAuthStore from "../stores/authStore";
import { PieChart as PieChartIcon, Building2, Wallet, TrendingUp, CreditCard } from "lucide-react/dist/esm/lucide-react.mjs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { getProjects } from "../api/projectApi";
import { getExpenses } from "../api/expenseApi";
import { getProjectPayments } from "../api/projectPaymentApi";
import formatIndianAmount from "../utils/formatAmount";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState("yearly");

  // Helper function to get date range based on filter
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();

    switch (timeFilter) {
      case "daily":
        start.setDate(end.getDate() - 1);
        break;
      case "weekly":
        start.setDate(end.getDate() - 7);
        break;
      case "monthly":
        start.setMonth(end.getMonth() - 1);
        break;
      case "quarterly":
        start.setMonth(end.getMonth() - 3);
        break;
      case "yearly":
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setFullYear(end.getFullYear() - 1);
    }
    return { start, end };
  };

  // Helper function to check if date is within range
  const isDateInRange = (dateString) => {
    const date = new Date(dateString);
    const { start, end } = getDateRange();
    return date >= start && date <= end;
  };

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects
  });

  const { data: expensesData } = useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses
  });

  const projects = Array.isArray(projectsData?.data)
    ? projectsData.data
    : Array.isArray(projectsData?.data?.data)
    ? projectsData.data.data
    : Array.isArray(projectsData)
    ? projectsData
    : [];
  const expenses = Array.isArray(expensesData?.data)
    ? expensesData.data
    : Array.isArray(expensesData?.data?.data)
    ? expensesData.data.data
    : Array.isArray(expensesData)
    ? expensesData
    : [];

  // Fetch payments for all projects
  const paymentsQueries = useQueries({
    queries: projects.map(project => ({
      queryKey: ["projectPayments", project.id],
      queryFn: () => getProjectPayments(project.id),
      enabled: !!project.id
    }))
  });

  // Calculate total client payments (all-time)
  const totalClientPayments = paymentsQueries
    .flatMap(query => query.data?.data || [])
    .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

  // Filter expenses by date range
  const filteredExpenses = expenses.filter(expense => isDateInRange(expense.expense_date));

  // Filter payments by date range
  const allPayments = paymentsQueries
    .flatMap(query => query.data?.data || [])
    .filter(payment => isDateInRange(payment.payment_date));

  // Calculate filtered totals
  const filteredTotalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  const filteredTotalPayments = allPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
  const filteredGstPaid = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.gst_amount || 0), 0);
  const filteredGstCollected = allPayments.reduce((sum, payment) => sum + parseFloat(payment.gst_amount || 0), 0);
  const profit = filteredTotalPayments - filteredTotalExpenses;

  // Create trend data by date
  const getTrendData = () => {
    const { start, end } = getDateRange();
    const trendMap = {};
    
    // Initialize trend dates
    const current = new Date(start);
    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      trendMap[dateKey] = { date: dateKey, expense: 0, income: 0 };
      
      if (timeFilter === "daily") {
        current.setHours(current.getHours() + 1);
      } else if (timeFilter === "weekly") {
        current.setDate(current.getDate() + 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    // Add expenses to trend
    filteredExpenses.forEach(expense => {
      const dateKey = expense.expense_date.split('T')[0];
      if (trendMap[dateKey]) {
        trendMap[dateKey].expense += parseFloat(expense.amount || 0);
      }
    });

    // Add payments to trend
    allPayments.forEach(payment => {
      const dateKey = payment.payment_date.split('T')[0];
      if (trendMap[dateKey]) {
        trendMap[dateKey].income += parseFloat(payment.amount || 0);
      }
    });

    return Object.values(trendMap).slice(0, timeFilter === "daily" ? 24 : 30);
  };

  const trendData = getTrendData();

  // Group filtered expenses by project
  const expensesByProject = projects.map(project => {
    const projectExpenses = filteredExpenses.filter(expense => expense.project_id === project.id);
    const totalAmount = projectExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    return {
      id: project.id,
      name: project.name,
      value: totalAmount,
      projectBudget: parseFloat(project.budget || 0)
    };
  });

  // Filter out projects with zero expenses for pie chart
  const projectsWithExpenses = expensesByProject.filter(p => p.value > 0);

  // Calculate overall totals (not filtered)
  const totalProjects = projects.length;
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  const totalBudget = projects.reduce((sum, project) => sum + parseFloat(project.budget || 0), 0);
  const budgetLeft = totalBudget - totalExpenses;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Hi {user?.name || "User"}!</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Time Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {["daily", "weekly", "monthly", "quarterly", "yearly"].map(filter => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${
              timeFilter === filter
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/30"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-sm"
            }`}>
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Filtered Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Filtered Total Expenses */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-green-600">{timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} Expenses</p>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-green-700">{formatIndianAmount(filteredTotalExpenses)}</p>
            </div>
            <Wallet size={32} className="text-green-300" />
          </div>
        </div>

        {/* Filtered Total Income */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-blue-600">{timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} Income</p>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-blue-700">{formatIndianAmount(filteredTotalPayments)}</p>
            </div>
            <CreditCard size={32} className="text-blue-300" />
          </div>
        </div>

        {/* Profit */}
        <div className={`bg-gradient-to-br ${profit >= 0 ? "from-emerald-50 to-emerald-100 border-emerald-200" : "from-red-50 to-red-100 border-red-200"} p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs md:text-sm font-medium ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>Net Cash Flow</p>
              <p className={`text-2xl md:text-3xl font-bold mt-2 ${profit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {formatIndianAmount(profit)}
              </p>
            </div>
            <TrendingUp size={32} className={profit >= 0 ? "text-emerald-300" : "text-red-300"} />
          </div>
        </div>

        {/* Total Budget */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-orange-600">Total Budget</p>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-orange-700">{formatIndianAmount(totalBudget)}</p>
            </div>
            <Building2 size={32} className="text-orange-300" />
          </div>
        </div>
      </div>

      {/* Trend Charts */}
      {trendData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense & Income Trend */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Expense & Income Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={value => formatIndianAmount(value)} />
                <Legend />
                <Line type="monotone" dataKey="expense" stroke="#f59e0b" strokeWidth={2} name="Expense" />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cash Flow Trend */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Net Cash Flow Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={value => formatIndianAmount(value)} />
                <Bar dataKey="expense" stackId="a" fill="#f59e0b" name="Expense" />
                <Bar dataKey="income" stackId="a" fill="#10b981" name="Income" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Cards */}
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> */}
        {/* Total Projects */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-blue-600">Total Projects</p>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-blue-700">{totalProjects}</p>
            </div>
            <Building2 size={32} className="text-blue-300" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-green-600">Total Expenses</p>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-green-700">{formatIndianAmount(totalExpenses)}</p>
            </div>
            <Wallet size={32} className="text-green-300" />
          </div>
        </div>

        {/* Total Budget */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-orange-600">Total Budget</p>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-orange-700">{formatIndianAmount(totalBudget)}</p>
            </div>
            <TrendingUp size={32} className="text-orange-300" />
          </div>
        </div>

        {/* Total Client Payments */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-indigo-600">Total Client Payments</p>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-indigo-700">{formatIndianAmount(totalClientPayments)}</p>
            </div>
            <CreditCard size={32} className="text-indigo-300" />
          </div>
        </div>

        {/* GST Collected */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-indigo-600">GST Collected</p>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-indigo-700">{formatIndianAmount(filteredGstCollected)}</p>
            </div>
            <CreditCard size={32} className="text-indigo-300" />
          </div>
        </div>

        {/* GST Paid */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-green-600">GST Paid</p>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-green-700">{formatIndianAmount(filteredGstPaid)}</p>
            </div>
            <Wallet size={32} className="text-green-300" />
          </div>
        </div>

        {/* Budget Left */}
        <div
          className={`bg-gradient-to-br ${budgetLeft >= 0 ? "from-purple-50 to-purple-100 border-purple-200" : "from-red-50 to-red-100 border-red-200"} p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs md:text-sm font-medium ${budgetLeft >= 0 ? "text-purple-600" : "text-red-600"}`}>Budget Left</p>
              <p className={`text-2xl md:text-3xl font-bold mt-2 ${budgetLeft >= 0 ? "text-purple-700" : "text-red-700"}`}>
                {formatIndianAmount(budgetLeft)}
              </p>
            </div>
            <PieChartIcon size={32} className={budgetLeft >= 0 ? "text-purple-300" : "text-red-300"} />
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      {projectsWithExpenses.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Expenses by Project</h2>
          <div className="w-full h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectsWithExpenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatIndianAmount(value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value">
                  {projectsWithExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={value => formatIndianAmount(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Project Cards with Mini Pie Charts */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">Project Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {expensesByProject.map(project => {
              const expensePercentage = project.projectBudget > 0 ? (project.value / project.projectBudget) * 100 : 0;
              const remaining = project.projectBudget - project.value;
              const chartData = [
                { name: "Spent", value: project.value },
                { name: "Remaining", value: Math.max(0, remaining) }
              ];

              return (
                <div key={project.id} className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-200">
                  <div className="mb-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">{project.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">Budget Utilization</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}>
                            <Cell fill="#3B82F6" />
                            <Cell fill="#E5E7EB" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex-1">
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs md:text-sm font-medium text-gray-700">Budget</span>
                          <span className="text-xs md:text-sm font-semibold text-gray-900">{formatIndianAmount(project.projectBudget)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(expensePercentage, 100)}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <p className="text-blue-600 font-medium">Spent</p>
                          <p className="text-blue-700 font-bold">{formatIndianAmount(project.value)}</p>
                        </div>
                        <div className={`p-2 rounded border ${remaining >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                          <p className={`font-medium ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>Left</p>
                          <p className={`font-bold ${remaining >= 0 ? "text-green-700" : "text-red-700"}`}>{formatIndianAmount(remaining)}</p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{expensePercentage.toFixed(1)}% used</span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${expensePercentage > 100 ? "bg-red-100 text-red-700" : expensePercentage > 80 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                            {expensePercentage > 100 ? "Over Budget" : expensePercentage > 80 ? "Warning" : "On Track"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="bg-white p-8 md:p-12 rounded-lg shadow text-center border border-gray-200">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Projects Yet</h3>
          <p className="text-sm text-gray-500">Create a project to start tracking expenses</p>
        </div>
      )}

      {/* Monthly GST Summary */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Monthly GST Summary</h2>
        <GSTMonthlySummary expenses={filteredExpenses} payments={allPayments} />
      </div>
    </div>
  );
}

function GSTMonthlySummary({ expenses = [], payments = [] }) {
  // Aggregate by YYYY-MM
  const map = {};

  expenses.forEach(exp => {
    const key = (exp.expense_date || '').slice(0,7);
    if (!key) return;
    map[key] = map[key] || { month: key, gstPaid: 0, gstCollected: 0 };
    map[key].gstPaid += parseFloat(exp.gst_amount || 0);
  });

  payments.forEach(p => {
    const key = (p.payment_date || '').slice(0,7);
    if (!key) return;
    map[key] = map[key] || { month: key, gstPaid: 0, gstCollected: 0 };
    map[key].gstCollected += parseFloat(p.gst_amount || 0);
  });

  const rows = Object.values(map).sort((a,b) => a.month.localeCompare(b.month));

  if (rows.length === 0) return <p className="text-sm text-gray-500">No GST data for selected period.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr>
            <th className="p-2 border-b">Month</th>
            <th className="p-2 border-b">GST Collected</th>
            <th className="p-2 border-b">GST Paid</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.month}>
              <td className="p-2 border-b">{r.month}</td>
              <td className="p-2 border-b">{formatIndianAmount(r.gstCollected || 0)}</td>
              <td className="p-2 border-b">{formatIndianAmount(r.gstPaid || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
