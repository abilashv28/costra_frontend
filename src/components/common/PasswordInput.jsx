import { forwardRef, useEffect, useState } from "react";

const PasswordInput = forwardRef(
  (
    {
      label,
      error,
      className = "",
      wrapperClassName = "",
      showCriteria = false,
      value: controlledValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValue, setPasswordValue] = useState(controlledValue ?? "");
    const [criteriaVisible, setCriteriaVisible] = useState(false);

    useEffect(() => {
      setPasswordValue(controlledValue ?? "");
    }, [controlledValue]);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const handleInputChange = (event) => {
      setPasswordValue(event.target.value);
      if (onChange) {
        onChange(event);
      }
    };

    const handleInputFocus = () => {
      if (showCriteria) {
        setCriteriaVisible(true);
      }
    };

    const validationRules = [
      {
        key: "length",
        label: "At least 8 characters",
        test: (value) => value.length >= 8,
      },
      {
        key: "lowercase",
        label: "Lowercase letter (a-z)",
        test: (value) => /[a-z]/.test(value),
      },
      {
        key: "uppercase",
        label: "Uppercase letter (A-Z)",
        test: (value) => /[A-Z]/.test(value),
      },
      {
        key: "number",
        label: "Number (0-9)",
        test: (value) => /[0-9]/.test(value),
      },
      {
        key: "special",
        label: "Special character (!@#$%^&*()_+-=[]{}|;:'\",.<>/? )",
        test: (value) => /[!@#$%^&*()_+\-=[\]{}|;:'",.<>/?]/.test(value),
      },
    ];

    return (
      <div className={wrapperClassName}>
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={`w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-150 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 pr-10 ${className}`}
            {...props}
            value={controlledValue ?? passwordValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          <div
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer p-0 m-0"
          >
            {showPassword ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {showCriteria && (
          <div
            className={`mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 transition-all duration-300 ease-out ${criteriaVisible ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-3"}`}
          >
            <p className="mb-3 font-semibold text-slate-900">Your password must contain:</p>
            <ul className="space-y-2">
              {validationRules.map((rule) => {
                const passed = rule.test(passwordValue);
                return (
                  <li key={rule.key} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${passed ? "bg-emerald-500 text-white" : "bg-red-100 text-red-600"}`}
                    >
                      {passed ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.707-9.707a1 1 0 011.414 0L10 9.586l.293-.293a1 1 0 011.414 1.414L11.414 11l.293.293a1 1 0 01-1.414 1.414L10 12.414l-.293.293a1 1 0 01-1.414-1.414L8.586 11l-.293-.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                    <span className={passed ? "text-slate-900" : "text-slate-600"}>{rule.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
