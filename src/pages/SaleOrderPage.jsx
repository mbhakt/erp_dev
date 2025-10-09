import React from 'react';
import { useNavigate } from 'react-router-dom';
import SharedTable from '../components/SharedTable';
import AppLayout from '../components/AppLayout';

const orderColumns = [
  { key: 'date', label: 'Date' },
  { key: 'number', label: 'Order No' },
  { key: 'party', label: 'Party Name' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

const orderRows = [
  { id: 'o1', date: '2025-08-20', number: 'SO-001', party: 'ACME', amount: '₹ 5,000.00', status: 'Confirmed' },
];

export default function SaleOrderPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Sale Order</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-emerald-50 text-emerald-700">+ Add Order</button>
          <button
            className="px-3 py-1 rounded border"
            onClick={() => navigate(-1)}
            title="Close / Back"
          >
            Close
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <SharedTable
          columns={orderColumns}
          data={orderRows}
          actions={(row) => (
            <>
              <button className="px-2 py-1 border rounded mr-2">View</button>
              <button className="px-2 py-1 border rounded">Print</button>
            </>
          )}
        />
      </div>
    </div>
    </AppLayout>
  );
}