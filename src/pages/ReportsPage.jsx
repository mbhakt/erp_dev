// src/pages/ReportsPage.jsx
import React, { useMemo, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Card,
  Row,
  Col,
  DatePicker,
  Form,
  message,
} from "antd";
import { SearchOutlined, DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import AppLayout from "../components/AppLayout";
/*
 ReportsPage.jsx
 - Mock-data driven reports page
 - Indian date format (DD-MM-YYYY)
 - Amounts shown with two decimals
 - CSV export and print
 - Drop-in replacement for src/pages/ReportsPage.jsx
*/

// Helper: format ISO or Date -> DD-MM-YYYY
function formatDateIndian(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
}

// Helper: parse DD-MM-YYYY (returns Date or null)
function parseDateDDMMYYYY(text) {
  if (!text) return null;
  const parts = String(text).split("-");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

// CSV helper
function toCSV(rows, columns) {
  const headers = columns.map((c) => (c.title ? c.title : c.dataIndex));
  const escapeCell = (v) =>
    `"${String(v ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const lines = [headers.map(escapeCell).join(",")];
  for (const r of rows) {
    const row = columns.map((c) => {
      const v = c.render ? c.render(r[c.dataIndex], r) : r[c.dataIndex];
      // If render returned a React node, try to extract simple value:
      const cellText =
        typeof v === "string" || typeof v === "number" ? v : String(v ?? "");
      return escapeCell(cellText);
    });
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

// Mock dataset (replace with API in future)
const MOCK = [
  {
    id: 1,
    type: "Sale",
    refNo: "S-1001",
    party: "Madhav Bhakta",
    date: "2025-10-03",
    total: 12460,
  },
  {
    id: 2,
    type: "Purchase",
    refNo: "P-204",
    party: "Amit Traders",
    date: "2025-09-26",
    total: 235.2,
  },
  {
    id: 3,
    type: "Expense",
    refNo: "E-77",
    party: "Office Supplies",
    date: "2025-09-26",
    total: 235.2,
  },
  {
    id: 4,
    type: "Sale",
    refNo: "S-1002",
    party: "Navrang The Print Shoppe",
    date: "2025-10-05",
    total: 5200.5,
  },
  {
    id: 5,
    type: "Purchase",
    refNo: "P-205",
    party: "Mahalasa Distributors",
    date: "2025-10-01",
    total: 9999.99,
  },
];

export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [data] = useState(MOCK);
  const [loadingExport, setLoadingExport] = useState(false);

  // Derived filtered rows
  const filtered = useMemo(() => {
    const from = parseDateDDMMYYYY(dateFrom);
    const to = parseDateDDMMYYYY(dateTo);
    return data.filter((r) => {
      // type
      if (type !== "all" && r.type !== type) return false;
      // query in party/refNo
      const q = query.trim().toLowerCase();
      if (q) {
        const hay = `${r.party} ${r.refNo} ${r.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // date range (inclusive) - r.date is ISO string 'YYYY-MM-DD' or Date
      const rd = new Date(r.date);
      if (from && rd < from) return false;
      if (to && rd > new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59)) return false;
      return true;
    });
  }, [data, query, type, dateFrom, dateTo]);

  const columns = [
    {
      title: "Ref No",
      dataIndex: "refNo",
      key: "refNo",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Party / Payee",
      dataIndex: "party",
      key: "party",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (val) => formatDateIndian(val),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Total (₹)",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (val) => Number(val || 0).toFixed(2),
      sorter: (a, b) => Number(a.total) - Number(b.total),
    },
  ];

  function handleExportCSV() {
    try {
      setLoadingExport(true);
      const csv = toCSV(filtered, columns);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      message.success("CSV exported");
    } catch (err) {
      console.error(err);
      message.error("Export failed");
    } finally {
      setLoadingExport(false);
    }
  }

  function handlePrint() {
    // Simple print: render table HTML in new window
    const rowsHtml = [
      "<table border='1' cellpadding='6' cellspacing='0' style='border-collapse:collapse;width:100%'>",
      "<thead><tr>" +
        columns.map((c) => `<th style="text-align:left">${c.title}</th>`).join("") +
        "</tr></thead>",
      "<tbody>",
    ];
    for (const r of filtered) {
      rowsHtml.push(
        "<tr>" +
          columns
            .map((c) => {
              const v = c.render ? c.render(r[c.dataIndex], r) : r[c.dataIndex];
              return `<td>${v ?? ""}</td>`;
            })
            .join("") +
          "</tr>"
      );
    }
    rowsHtml.push("</tbody></table>");
    const w = window.open("", "_blank", "noopener");
    if (!w) {
      message.error("Unable to open print window");
      return;
    }
    w.document.write(`<html><head><title>Reports</title></head><body>${rowsHtml.join("")}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  return (
    <AppLayout>
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Reports</h1>

      <Card className="mb-6">
        <Form layout="vertical">
          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item label="Search (party, ref no, type)">
                <Input
                  placeholder="Search..."
                  prefix={<SearchOutlined />}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item label="Type">
                <Select value={type} onChange={(v) => setType(v)}>
                  <Select.Option value="all">All</Select.Option>
                  <Select.Option value="Sale">Sale</Select.Option>
                  <Select.Option value="Purchase">Purchase</Select.Option>
                  <Select.Option value="Expense">Expense</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={10}>
              <Form.Item label="Date range (DD-MM-YYYY)">
                <Space className="w-full" size={8}>
                  <Input
                    placeholder="From (DD-MM-YYYY)"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <Input
                    placeholder="To (DD-MM-YYYY)"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </Space>
                <div className="text-xs text-slate-400 mt-1">
                  Use DD-MM-YYYY (e.g. 05-10-2025). Leave blank to include all dates.
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button type="primary" onClick={() => { /* retains filters via state */ }}>
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setQuery("");
                    setType("all");
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Reset
                </Button>
              </Space>
            </Col>

            <Col>
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExportCSV}
                  loading={loadingExport}
                >
                  Export CSV
                </Button>
                <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                  Print
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table
          dataSource={filtered.map((r) => ({ ...r, key: r.id }))}
          columns={columns}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "No records match the current filters" }}
        />
      </Card>
    </main>
    </AppLayout>
  );
}