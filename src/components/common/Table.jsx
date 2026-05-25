import { useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";

import {
  Eye,
  Edit3,
  Trash2,
} from "lucide-react/dist/esm/lucide-react.mjs";

import Select from "./Select";

export default function Table({
  columns,
  data = [],
  rowsPerPageOptions = [5, 10, 25],
  initialRowsPerPage = 5,
  onView,
  onEdit,
  onDelete,
}) {
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(initialRowsPerPage);

  const [mobileVisibleRows, setMobileVisibleRows] =
    useState(initialRowsPerPage);

  const totalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil(data.length / rowsPerPage)
      ),
    [data.length, rowsPerPage]
  );

  const pagedData = useMemo(
    () =>
      data.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [data, page, rowsPerPage]
  );

  const mobileData = useMemo(
    () => data.slice(0, mobileVisibleRows),
    [data, mobileVisibleRows]
  );

  const hasMoreMobile = mobileVisibleRows < data.length;

  const handleLoadMore = () => {
    setMobileVisibleRows((current) =>
      Math.min(data.length, current + initialRowsPerPage)
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

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-xs font-medium text-gray-700 md:text-sm"
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
                  className="hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-xs text-gray-700 md:text-sm"
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
                                className="rounded border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
                              >
                                <Eye size={16} />
                              </button>
                            )}

                            {onEdit && (
                              <button
                                type="button"
                                onClick={() => onEdit?.(row)}
                                className="rounded border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
                              >
                                <Edit3 size={16} />
                              </button>
                            )}

                            {onDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete?.(row)}
                                className="rounded border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-red-500 hover:text-red-600"
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
                  className="px-4 py-10 text-center text-sm text-gray-500"
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
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            No records found.
          </div>
        )}
      </div>

      {/* Desktop Pagination */}
      <div className="hidden lg:flex flex-col gap-3 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            Prev
          </button>

          <span className="text-xs text-gray-700 md:text-sm">
            Page {page + 1} of {totalPages}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={page >= totalPages - 1}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            Next
          </button>
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
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
      {onView && (
        <button
          type="button"
          onClick={() => onView?.(row)}
          className="flex h-full items-center justify-center rounded-l bg-blue-500 px-4 text-white"
        >
          <Eye size={18} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit?.(row)}
          className="flex h-full items-center justify-center bg-yellow-500 px-4 text-white"
        >
          <Edit3 size={18} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete?.(row)}
          className="flex h-full items-center justify-center rounded-r bg-red-500 px-4 text-white"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  ) : null;

  const swipeTranslate = isOpen ? "-translate-x-[148px]" : "translate-x-0";

  return (
    <div className="relative overflow-hidden rounded-lg">
      {actionContainer}

      {/* Swipeable Content */}
      <div
        {...handlers}
        className={`relative z-10 rounded-lg border bg-gray-50 p-4 transition-transform duration-300 ${swipeTranslate}`}
      >
        {columns
          .filter(
            (column) => column.key !== "actions"
          )
          .map((column) => (
            <div
              key={column.key}
              className="flex items-start justify-between py-1 text-xs md:text-sm"
            >
              <span className="font-medium text-gray-700">
                {column.label}:
              </span>

              <span className="ml-2 text-right text-gray-600">
                {row[column.key] ?? "-"}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}