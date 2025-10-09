import React from 'react';
import { useNavigate } from 'react-router-dom';
import SharedTable from '../components/SharedTable';
import AppLayout from '../components/AppLayout';

const challanColumns = [
  { key: 'date', label: 'Date' },
  { key: 'number', label: 'Challan No' },
  { key: 'party', label: 'Party Name' },
  { key: 'items', label: 'Items' },
  { key: 'status', label: 'Status' },
];

const challanRows = [
  { id: 'c1', date: '2025-09-07', number: 'DC-001', party: 'Sreedevi Printers', items: '3', status: 'Dispatched' },
];

export default function DeliveryChallanPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Delivery Challan</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-emerald-50 text-emerald-700">+ Add Challan</button>
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
          columns={challanColumns}
          data={challanRows}
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