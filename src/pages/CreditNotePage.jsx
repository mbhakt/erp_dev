import React from 'react';
import { useNavigate } from 'react-router-dom';
import SharedTable from '../components/SharedTable';
import AppLayout from '../components/AppLayout';

const creditColumns = [
  { key: 'date', label: 'Date' },
  { key: 'number', label: 'Credit Note No' },
  { key: 'party', label: 'Party Name' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

const creditRows = [
  { id: 'r1', date: '2025-09-10', number: 'CN-001', party: 'ACME', amount: '₹ 250.00', status: 'Issued' },
];

export default function CreditNotePage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Sale Return / Credit Note</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-emerald-50 text-emerald-700">+ Add Credit Note</button>
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
          columns={creditColumns}
          data={creditRows}
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