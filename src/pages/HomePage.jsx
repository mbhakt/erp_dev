import React from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";

// Small helper to render a KPI card
function KPICard({ title, value, note, trend }) {
  return (
    <div className="bg-white rounded-md border p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500">{title}</div>
          <div className="text-2xl font-semibold mt-2">{value}</div>
          {note && <div className="text-sm text-slate-400 mt-1">{note}</div>}
        </div>
        {trend && (
          <div className="ml-4 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trend === "up" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
              {trend === "up" ? "↑" : "↓"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple placeholder chart component (keeps things dependency-free)
function SimpleAreaChart({ className }) {
  return (
    <div className={`bg-white rounded-md border p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-600">Total Sale</div>
        <div className="text-sm">
          <select className="rounded border px-2 py-1 text-sm">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Simple SVG area chart approximation */}
      <div className="w-full h-56">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c7e0ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="g2" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Area */}
          <path d="M0,40 L8,40 L12,20 L20,18 L28,12 L36,6 L44,40 L52,40 L60,40 L68,40 L76,40 L84,40 L92,40 L100,40 Z" fill="url(#g1)" />
          {/* Line */}
          <path d="M8,40 L12,20 L20,18 L28,12 L36,6" fill="none" stroke="url(#g2)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// Card row for Most Used Reports
function ReportCard({ title }) {
  return (
    <div className="bg-white rounded-md border p-4 shadow-sm flex items-center justify-between">
      <div className="text-sm">{title}</div>
      <div className="text-slate-400">›</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader title="Home" subtitle="Welcome back — here's a quick overview" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* MAIN: left column (takes 9/12) */}
          <div className="lg:col-span-9 space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard title="Total Receivable" value="₹ 700" note="From 1 Party" trend="down" />
              <KPICard title="Total Payable" value="₹ 0" note="You don't have payables as of now" trend="up" />
              <KPICard title="Total Sale" value="₹ 1,000" note="This Month" />
            </div>

            {/* Chart */}
            <SimpleAreaChart />

            {/* Most Used Reports */}
            <div className="bg-white rounded-md border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-600">Most Used Reports</div>
                <a className="text-sm text-blue-600">View All</a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReportCard title="Sale Report" />
                <ReportCard title="All Transactions" />
                <ReportCard title="Daybook Report" />
                <ReportCard title="Party Statement" />
              </div>
            </div>
         </div>

          {/* RIGHT: widget rail */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-md border p-6 shadow-sm flex flex-col items-center justify-center h-56 text-center text-slate-500">
              <div className="mb-3">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mx-auto">
                  <rect x="3" y="7" width="18" height="10" rx="2" stroke="#9CA3AF" strokeWidth="1.2" />
                  <path d="M7 11h10" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" />
               </svg>
              </div>
              <div className="font-medium">It Looks So Empty in Here!</div>
              <div className="text-sm mt-2">Add one of our widgets to get started and view your business operations</div>
            </div>

            <div className="bg-white rounded-md border p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">Add Widget of Your Choice</div>
                <button className="px-3 py-1 rounded bg-blue-600 text-white">+</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

