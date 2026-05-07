import { theme } from "../../theme";

export default function Button({ children, variant = "primary", className = "", type = "button", ...props }) {
  const buttonClasses = [theme.button.base, theme.button[variant], className].filter(Boolean).join(" ");

  return (
    <button type={type} className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
