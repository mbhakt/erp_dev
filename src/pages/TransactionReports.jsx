import React, {useState, useEffect} from 'react';
import AppLayout from '../components/AppLayout';
import { Table, DatePicker, Select, Row, Col } from 'antd';
import ReportCard from './shared/ReportCard';
import dayjs from 'dayjs';

const mock = Array.from({length:20}).map((_,i)=> ({
  id: i+1,
  date: dayjs().subtract(i,'day').format('DD-MM-YYYY'),
  type: i%3===0 ? 'Sale' : (i%3===1 ? 'Purchase' : 'Expense'),
  party: ['A & Sons','B Traders','C Enterprises'][i%3],
  amount: ((i+1)*123).toFixed(2)
}));

export default function TransactionReports(){
  const [data,setData] = useState(mock);
  const [range,setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);

  useEffect(()=>{
    // default current month filter already applied
    const f = mock.filter(r=>{
      const d = dayjs(r.date, 'DD-MM-YYYY');
      return d.isBetween(range[0], range[1], 'day', '[]');
    });
    setData(f);
  }, [range]);

  const columns = [
    { title:'Date', dataIndex:'date' },
    { title:'Type', dataIndex:'type' },
    { title:'Party', dataIndex:'party' },
    { title:'Amount', dataIndex:'amount' }
  ];

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>All Transactions / Day Book</h2>
        <Row gutter={12} style={{marginBottom:12}}>
          <Col><DatePicker.RangePicker format="DD-MM-YYYY" value={range} onChange={(v)=>setRange(v)} /></Col>
          <Col><Select style={{width:220}} placeholder="Filter Type" allowClear options={[{value:'Sale',label:'Sale'},{value:'Purchase',label:'Purchase'},{value:'Expense',label:'Expense'}]} onChange={(val)=>{ if(!val) setData(mock); else setData(mock.filter(r=>r.type===val)); }} /></Col>
        </Row>

        <ReportCard title="Transactions" exportData={data} exportFilename="transactions">
          <Table dataSource={data} columns={columns} rowKey={r=>r.id} pagination={{pageSize:10}} />
        </ReportCard>
      </div>
    </AppLayout>
  );
}
