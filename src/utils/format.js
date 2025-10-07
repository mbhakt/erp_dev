// src/utils/format.js
import dayjs from "dayjs";

export function formatCurrencyINR(value) {
  const n = Number(value || 0);
  if (!isFinite(n)) return "₹ 0.00";
  // Indian grouping: use toLocaleString with 'en-IN'
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

export const currencyINR = (v) => {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);
};

export const formatDate = (value) => {
  if (!value) return "";
  return dayjs(value).format("DD-MM-YYYY");
};

// sum helpers
export const sum = (arr = [], key) => (arr || []).reduce((s, x) => s + Number(x?.[key] ?? 0), 0);
