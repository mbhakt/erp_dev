import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'antd';
import { getDashboard } from '../api/mockApi';
import { currencyINR } from '../utils/format';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getReports } from '../api/mockApi';

export default function Dashboard(){
  const [summary, setSummary] = useState({});
  const [chartData, setChartData] = useState([]);
  useEffect(()=>{ getDashboard().then(setSummary); getReports().then(r=>setChartData(r.sales||[])); },[]);
  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={16}>
        <Col span={8}><Card><h4>Total Receivable</h4><div style={{fontSize:22}}>{currencyINR(summary.totalReceivable)}</div></Card></Col>
        <Col span={8}><Card><h4>Total Payable</h4><div style={{fontSize:22}}>{currencyINR(summary.totalPayable)}</div></Card></Col>
        <Col span={8}><Card><h4>Total Sale</h4><div style={{fontSize:22}}>{currencyINR(summary.totalSale)}</div></Card></Col>
      </Row>
      <Card style={{ marginTop:20 }} title="Total Sale">
        <div style={{ height:220 }}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><Line type="monotone" dataKey="value" stroke="#2a9df4" strokeWidth={3} dot={{r:4}}/></LineChart></ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
