// src/utils/normalize.js
// Small helpers to canonicalize ids and invoice shapes across the app.

export function canonicalId(obj) {
  if (!obj || typeof obj !== 'object') return '';
  return String(obj.id ?? obj._id ?? obj.invoice_id ?? obj.invoiceId ?? obj.invoiceNo ?? obj.invoice_no ?? obj.number ?? '');
}

export function normalizeInvoice(invoice) {
  if (!invoice) return null;
  const inv = { ...invoice };
  inv.id = canonicalId(inv);
  inv.invoice_no = inv.invoice_no ?? inv.invoiceNo ?? inv.number ?? inv.id;
  inv.invoice_date = inv.invoice_date ?? inv.invoiceDate ?? inv.created_at ?? inv.createdAt ?? inv.date ?? '';
  // items should already be normalized by API, but ensure fallback
  const itemsList = inv.items ?? inv.invoice_items ?? inv.rows ?? inv.lines ?? [];
  inv.items = Array.isArray(itemsList) ? itemsList.map(it => ({
    item_id: String(it.item_id ?? it.itemId ?? it.id ?? it.product_id ?? ''),
    qty: Number(it.qty ?? it.quantity ?? 1),
    unit_price: Number(it.unit_price ?? it.price ?? it.rate ?? it.sale_price ?? 0),
    discount: Number(it.discount ?? 0),
    amount: Number(it.amount ?? it.line_total ?? ((it.qty ?? it.quantity ?? 0) * (it.unit_price ?? it.price ?? it.rate ?? 0)))
  })) : [];
  return inv;
}