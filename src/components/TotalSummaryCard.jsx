import React from 'react';
import { Card } from 'antd';
import { currencyINR } from '../utils/currencyINR';
export default function TotalSummaryCard({ subtotal, tax, grand }) {
  return (
    <Card title="Totals" style={{width:320}}>
      <div>Subtotal: {currencyINR(subtotal)}</div>
      <div>Tax: {currencyINR(tax)}</div>
      <div style={{fontWeight:700, marginTop:8}}>Grand Total: {currencyINR(grand)}</div>
    </Card>
  );
}