import React from 'react';
import AppLayout from '../components/AppLayout';
import { Table } from 'antd';
import ReportCard from './shared/ReportCard';

const data = [
  {id:1, item:'A4 Copier White', opening:10, purchase:50, sale:60, closing:0},
  {id:2, item:'Printing Ink', opening:5, purchase:20, sale:10, closing:15},
];

export default function StockReports(){
  const cols = [{title:'Item',dataIndex:'item'},{title:'Opening',dataIndex:'opening'},{title:'Purchase',dataIndex:'purchase'},{title:'Sale',dataIndex:'sale'},{title:'Closing',dataIndex:'closing'}];
  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Stock Summary</h2>
        <ReportCard title="Stock Summary" exportData={data} exportFilename="stock-summary">
          <Table dataSource={data} columns={cols} rowKey={r=>r.id} pagination={false} />
        </ReportCard>
      </div>
    </AppLayout>
  );
}
