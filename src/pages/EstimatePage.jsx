import React from 'react';
import { useNavigate } from 'react-router-dom';
import SharedTable from '../components/SharedTable';
import AppLayout from '../components/AppLayout';

const estimateColumns = [
  { key: 'date', label: 'Date' },
  { key: 'number', label: 'Estimate No' },
  { key: 'party', label: 'Party Name' },
  { key: 'amount', label: 'Amount' },
  { key: 'balance', label: 'Balance' },
];

const estimateRows = [
  { id: 'est1', date: '2025-09-01', number: 'E001', party: 'ACME', amount: '₹ 1,000.00', balance: '₹ 500.00' },
];

export default function EstimatePage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Estimate / Quotations</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-emerald-50 text-emerald-700">+ Add Estimate</button>
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
          columns={estimateColumns}
          data={estimateRows}
          actions={(row) => (
            <>
              <button className="px-2 py-1 border rounded mr-2">Edit</button>
              <button className="px-2 py-1 border rounded">Print</button>
            </>
          )}
        />
      </div>
    </div>
    </AppLayout>
  );
}