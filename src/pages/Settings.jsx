import React from 'react';

export default function Settings() {
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-600">Business Name</label>
          <input className="w-full p-2 border rounded mt-2" />
        </div>

        <div>
          <label className="text-xs text-gray-600">GST Number</label>
          <input className="w-full p-2 border rounded mt-2" />
        </div>
      </div>

      <div className="mt-6">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
      </div>
    </div>
  );
}
