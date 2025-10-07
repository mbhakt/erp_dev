import React from 'react';
import AppLayout from '../components/AppLayout';
import { Row, Col, Card } from 'antd';

export default function ReportsHomePage(){
  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Reports Hub</h2>
        <Row gutter={16} style={{marginTop:12}}>
          <Col span={6}><Card title="Total Sales">₹ 1,23,456.00</Card></Col>
          <Col span={6}><Card title="Total Purchases">₹ 78,234.00</Card></Col>
          <Col span={6}><Card title="Total Expenses">₹ 12,345.00</Card></Col>
          <Col span={6}><Card title="Net Profit">₹ 32,877.00</Card></Col>
        </Row>
        <div style={{marginTop:16}}>
          <Card>Quick links: Day Book, Party Statement, Stock Summary</Card>
        </div>
      </div>
    </AppLayout>
  );
}
