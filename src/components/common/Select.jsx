import { forwardRef } from "react";

const Select = forwardRef(
  ({ label, error, className = "", wrapperClassName = "", children, ...props }, ref) => {
    return (
      <div className={wrapperClassName}>
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-16 text-sm text-slate-900 shadow-sm transition duration-150 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
