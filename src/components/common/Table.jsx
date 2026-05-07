import { useMemo, useState } from "react";
import Select from "./Select";

export default function Table({ columns, data = [], rowsPerPageOptions = [5, 10, 25], initialRowsPerPage = 5 }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.length / rowsPerPage)), [data.length, rowsPerPage]);
  const pagedData = useMemo(
    () => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [data, page, rowsPerPage]
  );

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handlePrev = () => setPage((current) => Math.max(0, current - 1));
  const handleNext = () => setPage((current) => Math.min(totalPages - 1, current + 1));

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      {/* table view for desktop screens */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium text-gray-700 text-xs md:text-sm">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pagedData.length > 0 ? (
              pagedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-gray-700 text-xs md:text-sm">
                      {row[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile screens */}
      <div className="lg:hidden">
        {pagedData.length > 0 ? (
          <div className="space-y-3 p-4">
            {pagedData.map((row) => (
              <div key={row.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                {columns.map((column) => (
                  <div key={column.key} className="flex justify-between items-start py-1 text-xs md:text-sm">
                    <span className="font-medium text-gray-700">{column.label}:</span>
                    <span className="text-gray-600 text-right ml-2">{row[column.key] ?? "-"}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            No records found.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-gray-50">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
          <span>Rows per page:</span>
          <Select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs md:text-sm"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs md:text-sm text-gray-700 sm:justify-end">
          <span className="order-2 sm:order-1">
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={page === 0}
              className="rounded border border-gray-300 bg-white px-2 md:px-3 py-1 text-xs md:text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={page >= totalPages - 1}
              className="rounded border border-gray-300 bg-white px-2 md:px-3 py-1 text-xs md:text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
