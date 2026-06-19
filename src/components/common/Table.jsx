import { useMemo, useState, useRef, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

import {
  Eye,
  Edit3,
  Trash2,
  Filter,
  X,
  ChevronDown,
  Check,
  FilterX
} from "lucide-react/dist/esm/lucide-react.mjs";

import Select from "./Select";

// Custom Multi-Select Dropdown Component
function MultiSelectDropdown({ label, options, selectedValues, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newSelected = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newSelected);
  };

  const isAllSelected = selectedValues.length === options.length && options.length > 0;

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between w-full md:w-56 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${selectedValues.length > 0 ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
      >
        <span className="truncate mr-2">
          {selectedValues.length > 0 ? `${label} (${selectedValues.length})` : label}
        </span>
        <ChevronDown size={16} className={`transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="mt-2 w-full rounded-lg bg-white shadow-none border border-gray-100 focus:outline-none overflow-hidden md:absolute md:z-50 md:w-56 md:shadow-xl">
          <div className="p-2 max-h-60 overflow-auto">
            {options.length === 0 ? (
              <p className="text-sm text-gray-500 p-2 text-center">No options</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2 mb-1 border-b border-gray-100"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isAllSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                    {isAllSelected && <Check size={12} className="text-white" />}
                  </div>
                  Select All
                </button>
                {options.map((option, idx) => {
                  const isSelected = selectedValues.includes(option);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleOption(option)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <span className="truncate" title={String(option)}>{String(option)}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Table({
  columns,
  data = [],
  rowsPerPageOptions = [5, 10, 25],
  initialRowsPerPage = 5,
  onView,
  onEdit,
  onDelete,
  filterable = false,
  excludeFilters = ["actions", "file"]
}) {
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(initialRowsPerPage);

  const [mobileVisibleRows, setMobileVisibleRows] =
    useState(initialRowsPerPage);

  // Filtering state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({}); // { colKey: [selected options] }

  const filterableColumns = useMemo(() => {
    if (!filterable) return [];
    return columns.filter(col => !excludeFilters.includes(col.key));
  }, [columns, filterable, excludeFilters]);

  const filterOptions = useMemo(() => {
    if (!filterable) return {};
    const options = {};
    filterableColumns.forEach(col => {
      const uniqueValues = Array.from(new Set(data.map(row => row[col.key]))).filter(val => val !== null && val !== undefined && val !== "");
      options[col.key] = uniqueValues.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      });
    });
    return options;
  }, [data, filterable, filterableColumns]);

  const filteredData = useMemo(() => {
    if (!filterable || Object.keys(filters).length === 0) return data;
    
    return data.filter(row => {
      return Object.entries(filters).every(([colKey, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return true;
        return selectedValues.includes(row[colKey]);
      });
    });
  }, [data, filterable, filters]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  const totalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil(filteredData.length / rowsPerPage)
      ),
    [filteredData.length, rowsPerPage]
  );

  const pagedData = useMemo(
    () =>
      filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredData, page, rowsPerPage]
  );

  const mobileData = useMemo(
    () => filteredData.slice(0, mobileVisibleRows),
    [filteredData, mobileVisibleRows]
  );

  const hasMoreMobile = mobileVisibleRows < filteredData.length;

  const handleLoadMore = () => {
    setMobileVisibleRows((current) =>
      Math.min(filteredData.length, current + initialRowsPerPage)
    );
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handlePrev = () => {
    setPage((current) => Math.max(0, current - 1));
  };

  const handleNext = () => {
    setPage((current) =>
      Math.min(totalPages - 1, current + 1)
    );
  };

  const handleFilterChange = (colKey, selectedValues) => {
    setFilters(prev => {
      const newFilters = { ...prev, [colKey]: selectedValues };
      // Clean up empty filters
      if (selectedValues.length === 0) {
        delete newFilters[colKey];
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="space-y-4">
      {/* Filter Toggle Header */}
      {filterable && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm font-medium text-gray-500">
            Showing <span className="text-gray-900">{filteredData.length}</span> records
          </div>
          <button
            type="button"
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm border ${
              isFilterPanelOpen || activeFilterCount > 0
                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
            }`}
          >
            <Filter size={16} />
            Filters {activeFilterCount > 0 && <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs ml-1">{activeFilterCount}</span>}
          </button>
        </div>
      )}

      {/* Filter Panel (Transitions handled via CSS classes instead of && unmounting) */}
      {filterable && (
        <>
          {/* Mobile Overlay */}
          <div 
            className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-out md:hidden ${
              isFilterPanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsFilterPanelOpen(false)}
          />
          
          <div 
            className={`
              fixed inset-x-0 bottom-0 z-50 w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)
              md:static md:z-auto md:max-h-none md:rounded-lg md:shadow-sm md:flex md:flex-col
              ${isFilterPanelOpen 
                ? "translate-y-0 md:opacity-100 md:mt-4 md:border md:border-gray-200 md:overflow-visible" 
                : "translate-y-full md:opacity-0 md:mt-0 md:h-0 md:overflow-hidden md:border-transparent md:pointer-events-none md:-translate-y-2"
              }
            `}
          >
            <div className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Filter size={18} className="text-blue-600" />
                  Filter Records
                </h3>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition"
                    >
                      <FilterX size={14} />
                      Clear All
                    </button>
                  )}
                  {/* Mobile Close Button */}
                  <button 
                    type="button" 
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 md:hidden"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                {filterableColumns.map(col => (
                  <div key={col.key} className="flex flex-col gap-1.5 w-full md:w-auto">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">{col.label}</span>
                    <MultiSelectDropdown
                      label={`${col.label}`}
                      options={filterOptions[col.key] || []}
                      selectedValues={filters[col.key] || []}
                      onChange={(selected) => handleFilterChange(col.key, selected)}
                    />
                  </div>
                ))}
              </div>
              
              {/* Mobile Done Button */}
              <div className="mt-6 md:hidden">
                <button
                  type="button"
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-transform"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        {/* Desktop Table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-xs font-medium text-gray-700 md:text-sm whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {pagedData.length > 0 ? (
                pagedData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-xs text-gray-700 md:text-sm whitespace-nowrap"
                      >
                        {column.key === "actions" ? (
                          row.actions ? (
                            row.actions
                          ) : (
                            <div className="flex items-center gap-2">
                              {onView && (
                                <button
                                  type="button"
                                  onClick={() => onView?.(row)}
                                  className="rounded border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye size={16} />
                                </button>
                              )}

                              {onEdit && (
                                <button
                                  type="button"
                                  onClick={() => onEdit?.(row)}
                                  className="rounded border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit3 size={16} />
                                </button>
                              )}

                              {onDelete && (
                                <button
                                  type="button"
                                  onClick={() => onDelete?.(row)}
                                  className="rounded border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          )
                        ) : (
                          row[column.key] ?? "-"
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-sm text-gray-500 bg-gray-50/50"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {mobileData.length > 0 ? (
            <div className="space-y-3 p-4">
              {mobileData.map((row) => (
                <SwipeableCard
                  key={row.id}
                  row={row}
                  columns={columns}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}

              {hasMoreMobile && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-gray-500 bg-gray-50/50">
              No records found.
            </div>
          )}
        </div>

        {/* Desktop Pagination */}
        <div className="hidden lg:flex flex-col gap-3 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-700 md:text-sm">
            <span>Rows per page:</span>

            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs md:text-sm"
            >
              {rowsPerPageOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={page === 0}
              className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-700"
            >
              Prev
            </button>

            <span className="text-xs font-medium text-gray-700 md:text-sm mx-2">
              Page {page + 1} of {totalPages}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={page >= totalPages - 1}
              className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SwipeableCard({
  row,
  columns,
  onView,
  onEdit,
  onDelete,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => setIsOpen(true),
    onSwipedRight: () => setIsOpen(false),
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  const actionContainer = row.actions ? (
    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
      {row.actions}
    </div>
  ) : (onView || onEdit || onDelete) ? (
    <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center pr-2 space-y-2">
      {onView && (
        <button
          type="button"
          onClick={() => onView?.(row)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-blue-600"
        >
          <Eye size={18} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit?.(row)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-blue-600"
        >
          <Edit3 size={18} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete?.(row)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-red-600"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  ) : null;

  const swipeTranslate = isOpen ? "-translate-x-[100px]" : "translate-x-0";

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      {actionContainer}

      {/* Swipeable Content */}
      <div
        {...handlers}
        className={`relative z-10 rounded-lg bg-white p-4 transition-transform duration-300 ${swipeTranslate}`}
      >
        {columns
          .filter(
            (column) => column.key !== "actions"
          )
          .map((column) => (
            <div
              key={column.key}
              className="flex items-start justify-between py-1.5 text-xs md:text-sm border-b border-gray-50 last:border-0"
            >
              <span className="font-medium text-gray-500">
                {column.label}:
              </span>

              <span className="ml-2 text-right text-gray-900 font-medium break-all">
                {row[column.key] ?? "-"}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}