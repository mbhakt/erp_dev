// src/components/AppLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
         
          <Sidebar />
        </aside>
        <main className="flex-1 p-6">
          <div className="sticky top-0 z-10 bg-gray-50 pb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <div className="flex items-center space-x-3">
                <input placeholder="Search invoices, parties, items..." className="border rounded px-3 py-2 w-80" />
                <button className="px-3 py-2 bg-blue-600 text-white rounded">+ New</button>
              </div>
            </div>
          </div>
          <section className="mt-6">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}