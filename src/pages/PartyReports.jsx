import React, {useState, useEffect} from 'react';
import AppLayout from '../components/AppLayout';
import { Select, DatePicker, Table, Row, Col } from 'antd';
import ReportCard from './shared/ReportCard';
import dayjs from 'dayjs';

const parties = [{id:1,name:'A & Sons'},{id:2,name:'B Traders'},{id:3,name:'C Enterprises'}];
const mockAll = Array.from({length:30}).map((_,i)=>({id:i+1, date: dayjs().subtract(i,'day').format('DD-MM-YYYY'), partyId: (i%3)+1, particulars: 'Invoice #'+(100+i), debit: i%2? (i*10).toFixed(2): '0.00', credit: i%2? '0.00': (i*8).toFixed(2)}));

export default function PartyReports(){
  const [party, setParty] = useState(parties[0].id);
  const [range, setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [data, setData] = useState([]);

  useEffect(()=>{
    const f = mockAll.filter(r=> r.partyId===party && dayjs(r.date,'DD-MM-YYYY').isBetween(range[0], range[1],'day','[]'));
    setData(f);
  }, [party, range]);

  const columns = [{title:'Date',dataIndex:'date'},{title:'Particulars',dataIndex:'particulars'},{title:'Debit',dataIndex:'debit'},{title:'Credit',dataIndex:'credit'}];

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Party Statement</h2>
        <Row gutter={12} style={{marginBottom:12}}>
          <Col><Select value={party} options={parties.map(p=>({label:p.name,value:p.id}))} onChange={v=>setParty(v)} style={{width:220}} /></Col>
          <Col><DatePicker.RangePicker format="DD-MM-YYYY" value={range} onChange={(v)=>setRange(v)} /></Col>
        </Row>

        <ReportCard title={`Statement — ${parties.find(p=>p.id===party).name}`} exportData={data} exportFilename={`party-statement-${party}`}>
          <Table dataSource={data} columns={columns} rowKey={r=>r.id} pagination={{pageSize:10}} />
        </ReportCard>
      </div>
    </AppLayout>
  );
}
