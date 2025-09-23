import React from 'react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="text-sm text-gray-500">Invoices</div>
          <div className="text-2xl font-semibold mt-2">124</div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="text-sm text-gray-500">Receivables</div>
          <div className="text-2xl font-semibold mt-2">₹ 1,24,000</div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="text-sm text-gray-500">Expenses</div>
          <div className="text-2xl font-semibold mt-2">₹ 23,000</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        <ul className="text-sm text-gray-600">
          <li>Payment received from ABC Co — ₹ 5,000</li>
          <li>Invoice #23 sent to XYZ Pvt Ltd</li>
          <li>New item 'Widget' added</li>
        </ul>
      </div>
    </div>
  );
}
