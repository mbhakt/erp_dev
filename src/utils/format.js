export function money(v) {
  return '₹ ' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// src/utils/format.js
// Small formatting helpers for date & currency (INR)

export function formatDateIso(isoString, options = {}) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...options,
    }).format(date);
  } catch (e) {
    return isoString;
  }
}

export function formatDateTimeIso(isoString) {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch (e) {
    return isoString;
  }
}

export function formatCurrency(value, { currency = 'INR', maximumFractionDigits = 2 } = {}) {
  if (value == null || value === '') return '—';
  // if value is string, try to convert to number
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits
  }).format(n);
}

// small helper to display numeric totals without currency symbol (if needed)
export function formatNumber(value, options = {}) {
  if (value == null || value === '') return '0';
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: options.maximumFractionDigits ?? 2 }).format(n);
}
