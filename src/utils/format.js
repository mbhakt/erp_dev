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

// export const formatDate = (value) => {
//  if (!value) return "";
//  return dayjs(value).format("DD-MM-YYYY");
// };

export const formatDateIndian = (isoOrDate) => {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// sum helpers
export const sum = (arr = [], key) => (arr || []).reduce((s, x) => s + Number(x?.[key] ?? 0), 0);