export default function formatIndianAmount(value, options = {}) {
  const { currency = "₹", maxFractionDigits = 2 } = options;
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const rawValue = typeof value === "string" ? value.replace(/,/g, "") : value;
  const num = Number(rawValue);
  if (Number.isNaN(num)) {
    return String(value);
  }

  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);

  if (abs >= 1e7) {
    const crores = abs / 1e7;
    const formatted = Number.isInteger(crores)
      ? String(crores)
      : crores.toFixed(1).replace(/\.0$/, "");
    return `${sign}${currency}${formatted}Cr`;
  }

  if (abs >= 1e5) {
    const lakhs = abs / 1e5;
    const formatted = Number.isInteger(lakhs)
      ? String(lakhs)
      : lakhs.toFixed(1).replace(/\.0$/, "");
    return `${sign}${currency}${formatted}L`;
  }

  const formattedNumber = Number.isInteger(abs)
    ? abs.toLocaleString("en-IN")
    : abs.toLocaleString("en-IN", { maximumFractionDigits: maxFractionDigits });

  return `${sign}${currency}${formattedNumber}`;
}
