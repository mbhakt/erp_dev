import React from 'react';
import AppLayout from '../components/AppLayout';
import { Table } from 'antd';
import ReportCard from './shared/ReportCard';

const data = [
  {id:1, month:'2025-09', sales:12345.67, tax:234.56},
  {id:2, month:'2025-08', sales:9876.54, tax:123.45},
];

export default function GstReports(){
  const cols = [{title:'Period',dataIndex:'month'},{title:'Sales',dataIndex:'sales'},{title:'Tax',dataIndex:'tax'}];
  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>GST Reports</h2>
        <ReportCard title="GSTR-1 Summary" exportData={data} exportFilename="gstr1-summary">
          <Table dataSource={data} columns={cols} rowKey={r=>r.id} pagination={false} />
        </ReportCard>
      </div>
    </AppLayout>
  );
}