import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api/auditApi";
import Table from "../components/common/Table";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import { downloadExcel } from "../utils/exportUtils";
import { Download } from "lucide-react/dist/esm/lucide-react.mjs";

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => getAuditLogs(),
  });

  const logs = data?.data || [];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.User?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logs, searchQuery, actionFilter, entityFilter]);

  const columns = [
    { key: "created_at", label: "Date", format: (v) => new Date(v).toLocaleString() },
    { key: "user", label: "User", format: (_, log) => log.User?.username || "System" },
    { key: "action", label: "Action" },
    { key: "entity_type", label: "Entity" },
    { key: "description", label: "Description" },
  ];

  const handleExportExcel = () => {
    const exportHeaders = [
      { label: "Date", key: "created_at", format: (v) => new Date(v).toLocaleString() },
      { label: "User", key: "User", format: (v) => v?.username || "System" },
      { label: "Action", key: "action" },
      { label: "Entity", key: "entity_type" },
      { label: "Entity ID", key: "entity_id" },
      { label: "Description", key: "description" },
    ];
    downloadExcel(filteredLogs, exportHeaders, "Audit Logs", "audit_logs.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded bg-white p-4 md:p-6 shadow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Audit Logs</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Track all system activities and changes</p>
        </div>
        <div>
          <button onClick={handleExportExcel} className="inline-flex items-center justify-center gap-2 rounded border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition">
            <Download size={16}/> Export Excel
          </button>
        </div>
      </div>

      <section className="bg-white p-4 md:p-6 rounded shadow">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            label="Search" 
            type="text" 
            placeholder="Search by description or user..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Filter by Action
            <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm">
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </Select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Filter by Entity
            <Select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm">
              <option value="all">All Entities</option>
              <option value="Project">Project</option>
              <option value="Expense">Expense</option>
              <option value="Client">Client</option>
            </Select>
          </label>
        </div>

        {isLoading ? (
          <p className="text-center py-8 text-gray-500">Loading logs...</p>
        ) : filteredLogs.length > 0 ? (
          <Table columns={columns} data={filteredLogs} filterable={false} />
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No audit logs found.</p>
          </div>
        )}
      </section>
    </div>
  );
}
