import React from 'react';
import { Table, InputNumber, Select, Button, Input } from 'antd';

/**
 * EditableTable
 * - creates stable keys for rows
 * - uses Input for description
 * - exposes setRows to parent
 */
export default function EditableTable({ rows = [], setRows, items = [] }) {
  const onChange = (index, key, value) => {
    const next = [...rows];
    next[index] = { ...next[index], [key]: value };
    setRows(next);
  };

  const addRow = () =>
    setRows([
      ...rows,
      {
        key: `r_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        item_id: null,
        description: '',
        qty: 1,
        rate: 0,
        tax_percent: 0,
      },
    ]);

  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const columns = [
    {
      title: 'Item',
      dataIndex: 'item_id',
      render: (v, _, idx) => (
        <Select value={v} onChange={(val) => onChange(idx, 'item_id', val)} style={{ width: 200 }} showSearch>
          {items.map((it) => (
            <Select.Option key={it.id} value={it.id}>
              {it.item_name || it.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Desc',
      dataIndex: 'description',
      render: (v, _, idx) => <Input value={v} onChange={(e) => onChange(idx, 'description', e.target.value)} />,
    },
    { title: 'Qty', dataIndex: 'qty', render: (v, _, idx) => <InputNumber min={0} value={v} onChange={(val) => onChange(idx, 'qty', val)} /> },
    { title: 'Rate', dataIndex: 'rate', render: (v, _, idx) => <InputNumber min={0} value={v} onChange={(val) => onChange(idx, 'rate', val)} step={0.01} /> },
    { title: 'Tax %', dataIndex: 'tax_percent', render: (v, _, idx) => <InputNumber min={0} value={v} onChange={(val) => onChange(idx, 'tax_percent', val)} /> },
    { title: 'Amount', dataIndex: 'amount', render: (v, r) => (Number(r.qty || 0) * Number(r.rate || 0)).toFixed(2) },
    { title: 'Action', dataIndex: 'a', render: (_, __, idx) => <Button danger onClick={() => removeRow(idx)}>Remove</Button> },
  ];

  return (
    <div>
      <Button onClick={addRow} style={{ marginBottom: 8 }}>
        + Add Row
      </Button>
      <Table dataSource={rows} columns={columns} rowKey={(rec) => rec.key} pagination={false} />
    </div>
  );
}
