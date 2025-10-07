export function lineTotal(qty, rate) {
  const q = Number(qty)||0;
  const r = Number(rate)||0;
  return +(q*r).toFixed(2);
}
export function calcTax(amount, taxPercent) {
  const a = Number(amount)||0;
  const t = Number(taxPercent)||0;
  return +(a * t / 100).toFixed(2);
}
